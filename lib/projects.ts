import { source } from '@/lib/source';
import type { PageTree } from 'fumadocs-core/server';
import type { ReactNode } from 'react';
import fs from 'fs';
import path from 'path';

/** 主页卡片标签：文字 + 颜色（hex，省略则用项目主题色）。 */
export interface ProjectTag {
  label: string;
  color?: string;
}

export interface ProjectInfo {
  /** 项目根 slug，对应 content/docs/<slug>/ 目录名 */
  slug: string;
  /** 项目标题（取自 meta.json 的 title） */
  title: string;
  /** 项目描述 */
  description?: string;
  /** 主页卡片副标题 */
  tagline?: string;
  /** 主题色 (CSS 颜色值) */
  color?: string;
  /** 入口 URL（绝对路径，已含 /docs/） */
  entry: string;
  /** 已解析的图标 ReactNode（lucide 图标名，或 public 目录下的图片） */
  icon?: ReactNode;
  /** 主页卡片标签（开源 / 闭源 / 付费等） */
  tags?: ProjectTag[];
  /** 排序权重 */
  order: number;
  /** 是否隐藏 */
  hidden: boolean;
  /** 文档页数（统计该项目下的页面数量） */
  pageCount: number;
  /** 该项目最近更新时间戳（取项目目录中所有 mdx 文件 mtime 的最大值，单位 ms） */
  lastUpdated?: number;
  /** 该项目根目录的 PageTree.Folder 引用 */
  node: PageTree.Folder;
}

/**
 * 从 pageTree 中提取所有 root:true 项目（不递归找深层 root）。
 * 这是「多项目聚合」的真相之源。
 */
export function getProjects(): ProjectInfo[] {
  const tree = source.pageTree;
  const projects: ProjectInfo[] = [];

  for (const child of tree.children) {
    if (child.type !== 'folder') continue;
    if (!child.root) continue;

    const meta = source.getNodeMeta(child);
    const data = (meta?.data ?? {}) as ExtendedMeta;

    if (data.hidden) continue;

    // 从 meta.file 推导出 slug：file.dirname 形如 "core" 或 "shimmer"
    const slug = meta?.file.dirname ?? '';
    if (!slug) continue;

    const entry = data.entry
      ? `/docs/${data.entry.replace(/^\/+/, '')}`
      : (firstPageUrl(child) ?? `/docs/${slug}`);

    projects.push({
      slug,
      title: typeof child.name === 'string' ? child.name : (data.title ?? slug),
      description: data.description ?? toPlain(child.description),
      tagline: data.tagline,
      color: data.color,
      entry,
      icon: child.icon,
      tags: data.tags,
      order: data.order ?? 999,
      hidden: false,
      pageCount: countPages(child),
      lastUpdated: getLastUpdated(slug),
      node: child,
    });
  }

  return projects.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

/**
 * 根据 slug 找到对应项目。
 */
export function getProjectBySlug(slug: string): ProjectInfo | undefined {
  return getProjects().find((p) => p.slug === slug);
}

/**
 * 根据当前页面的 slug 数组定位它所属的项目（取第一段）。
 * 顶层独立页（如 /docs）返回 undefined。
 */
export function getProjectFromSlugs(slugs: string[] | undefined): ProjectInfo | undefined {
  if (!slugs || slugs.length === 0) return undefined;
  return getProjectBySlug(slugs[0]);
}

/**
 * 项目 slug -> 主题色（hex）的 map，供 ProjectThemeBoot 在 client 端注入 CSS 变量。
 */
export function getProjectThemeMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of getProjects()) {
    if (p.color) out[p.slug] = p.color;
  }
  return out;
}

/**
 * 把 RootToggle 的 Option[] 直接构造好（替代 fumadocs 默认的 getSidebarTabs，
 * 这样可以让 url 走 ProjectInfo.entry，并把 description/icon 用我们的 schema）。
 */
export function getRootToggleOptions() {
  return getProjects().map((p) => ({
    title: p.title,
    description: p.description ?? p.tagline,
    url: p.entry,
    icon: p.icon,
    urls: collectFolderUrls(p.node),
  }));
}

/** ============ 内部工具 ============ */

interface ExtendedMeta {
  title?: string;
  description?: string;
  pages?: string[];
  defaultOpen?: boolean;
  icon?: string;
  root?: boolean;
  // 我们扩展的字段：
  color?: string;
  entry?: string;
  tagline?: string;
  order?: number;
  hidden?: boolean;
  tags?: ProjectTag[];
}

function firstPageUrl(folder: PageTree.Folder): string | undefined {
  if (folder.index?.url) return folder.index.url;
  for (const child of folder.children) {
    if (child.type === 'page') return child.url;
    if (child.type === 'folder') {
      const u = firstPageUrl(child);
      if (u) return u;
    }
  }
  return undefined;
}

function countPages(folder: PageTree.Folder): number {
  let total = folder.index ? 1 : 0;
  for (const child of folder.children) {
    if (child.type === 'page') total += 1;
    else if (child.type === 'folder') total += countPages(child);
  }
  return total;
}

function collectFolderUrls(folder: PageTree.Folder): string[] {
  const urls: string[] = [];
  if (folder.index) urls.push(folder.index.url);
  for (const child of folder.children) {
    if (child.type === 'page') urls.push(child.url);
    else if (child.type === 'folder') urls.push(...collectFolderUrls(child));
  }
  return urls;
}

function toPlain(node: ReactNode): string | undefined {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  return undefined;
}

/**
 * 递归扫描项目目录下所有 .mdx 文件的 mtime，返回最大值（毫秒时间戳）。
 * 在 build 时执行；ISR / SSG 后该值固定。
 */
const lastUpdatedCache = new Map<string, number | undefined>();
function getLastUpdated(slug: string): number | undefined {
  if (lastUpdatedCache.has(slug)) return lastUpdatedCache.get(slug);

  const root = path.join(process.cwd(), 'content/docs', slug);
  let max: number | undefined;

  function walk(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
        try {
          const mtime = fs.statSync(full).mtimeMs;
          if (max === undefined || mtime > max) max = mtime;
        } catch {
          // ignore
        }
      }
    }
  }
  walk(root);

  lastUpdatedCache.set(slug, max);
  return max;
}

/**
 * 把毫秒时间戳格式化成「N 天前」「N 周前」「N 个月前」等中文相对时间。
 * 给定时刻早于现在；若 ts 为空返回 undefined。
 */
export function formatRelativeTime(ts: number | undefined, now: number = Date.now()): string | undefined {
  if (!ts) return undefined;
  const diff = now - ts;
  if (diff < 0) return '刚刚';

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < week) return `${Math.floor(diff / day)} 天前`;
  if (diff < month) return `${Math.floor(diff / week)} 周前`;
  if (diff < year) return `${Math.floor(diff / month)} 个月前`;
  return `${Math.floor(diff / year)} 年前`;
}
