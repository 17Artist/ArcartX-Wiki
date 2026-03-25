import { source } from '@/lib/source';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://wiki.arcartx.com';

function stripFrontmatter(content: string): string {
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) {
      return content.slice(end + 3).trim();
    }
  }
  return content;
}

function stripImports(content: string): string {
  return content
    .split('\n')
    .filter(line => !line.trim().startsWith('import '))
    .join('\n');
}

export async function GET() {
  const pages = source.getPages();
  const sections: string[] = [
    '# ArcartX Documentation (Full)',
    '',
    '> ArcartX 是一个 Minecraft 服务端插件框架，提供自定义模型、UI系统、特效、脚本引擎等功能。',
    '',
  ];

  for (const page of pages) {
    const title = page.data.title || page.slugs.join('/');
    const url = `${BASE_URL}${page.url}`;

    // 构建文件路径
    const slugPath = page.slugs.join('/');
    const possiblePaths = [
      path.join(process.cwd(), 'content/docs', `${slugPath}.mdx`),
      path.join(process.cwd(), 'content/docs', slugPath, 'index.mdx'),
    ];

    let rawContent = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        rawContent = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    const cleaned = stripImports(stripFrontmatter(rawContent));

    sections.push(`## ${title}`);
    sections.push(`URL: ${url}`);
    sections.push('');
    sections.push(cleaned || '(no content)');
    sections.push('');
    sections.push('---');
    sections.push('');
  }

  return new NextResponse(sections.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
