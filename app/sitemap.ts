import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { getProjects } from '@/lib/projects';
import { BASE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/docs`,
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified: now,
    },
  ];

  // 每个项目根入口
  for (const p of getProjects()) {
    entries.push({
      url: `${BASE_URL}${p.entry}`,
      changeFrequency: 'weekly',
      priority: 0.8,
      lastModified: p.lastUpdated ? new Date(p.lastUpdated) : now,
    });
  }

  // 所有文档页面
  for (const page of source.getPages()) {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: now,
    });
  }

  // 去重（同一 URL 只保留第一条）
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}
