import { source } from '@/lib/source';
import { NextResponse } from 'next/server';

const BASE_URL = 'https://wiki.arcartx.com';

export async function GET() {
  const pages = source.getPages();

  const lines: string[] = [
    '# ArcartX Documentation',
    '',
    '> ArcartX 是一个 Minecraft 服务端插件框架，提供自定义模型、UI系统、特效、脚本引擎等功能。',
    '',
    '## 文档页面',
    '',
  ];

  for (const page of pages) {
    const title = page.data.title || page.slugs.join('/');
    const desc = page.data.description || '';
    const url = `${BASE_URL}${page.url}`;
    lines.push(`- [${title}](${url})${desc ? `: ${desc}` : ''}`);
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
