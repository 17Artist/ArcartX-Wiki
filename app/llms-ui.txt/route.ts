import { source } from '@/lib/source';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://wiki.arcartx.com';

const INCLUDE_PREFIXES = [
  'core/8_ui/',
  'shimmer/',
];

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

function matchesPrefix(slugPath: string): boolean {
  const normalized = slugPath.toLowerCase();
  return INCLUDE_PREFIXES.some(prefix => normalized.startsWith(prefix.toLowerCase()));
}

export async function GET() {
  const pages = source.getPages().filter(page => {
    const slugPath = page.slugs.join('/') + '/';
    return matchesPrefix(slugPath);
  });

  const sections: string[] = [
    '# ArcartX UI & Shimmer 文档',
    '',
    '> 本文档包含 ArcartX 的 UI 系统和 Shimmer 脚本语言基础教学内容。',
    '',
  ];

  for (const page of pages) {
    const title = page.data.title || page.slugs.join('/');
    const url = `${BASE_URL}${page.url}`;

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
