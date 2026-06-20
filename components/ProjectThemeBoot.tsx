'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface ProjectThemeMap {
  /** slug -> hex color */
  [slug: string]: string;
}

/**
 * 根据当前路由切换 <html> 上的 data-project 与 --project-accent CSS 变量。
 * - data-project="core" 等：用于 CSS 选择器
 * - --project-accent: 项目主题色（hex），用于 inline 的 var() 引用
 *
 * 用 useEffect 在客户端切换，避免服务端 / 客户端渲染不一致。
 */
export function ProjectThemeBoot({ map }: { map: ProjectThemeMap }) {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    const slug = extractProjectSlug(pathname);
    if (slug && map[slug]) {
      html.dataset.project = slug;
      html.style.setProperty('--project-accent', map[slug]);
    } else {
      delete html.dataset.project;
      html.style.removeProperty('--project-accent');
    }
  }, [pathname, map]);

  return null;
}

function extractProjectSlug(pathname: string): string | undefined {
  // 形如 /docs/<project>/...
  const m = pathname.match(/^\/docs\/([^/]+)/);
  if (!m) return undefined;
  return m[1];
}
