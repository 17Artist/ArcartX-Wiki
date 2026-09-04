import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { getProjects } from '@/lib/projects';
import { ProjectSwitcher } from '@/components/ProjectSwitcher';
import 'fumadocs-twoslash/twoslash.css';

export default function Layout({ children }: { children: ReactNode }) {
  const projects = getProjects();

  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      sidebar={{
        tabs: false,
        banner: (
          <ProjectSwitcher
            options={projects.map((project) => ({
              slug: project.slug,
              title: project.title,
              description: project.description ?? project.tagline,
              url: project.entry,
              urls: collectProjectUrls(project.node),
              color: project.color,
              icon: project.icon,
            }))}
          />
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}

function collectProjectUrls(folder: (ReturnType<typeof getProjects>)[number]['node']): string[] {
  const urls: string[] = [];
  if (folder.index) urls.push(folder.index.url);
  for (const child of folder.children) {
    if (child.type === 'page') urls.push(child.url);
    else if (child.type === 'folder') urls.push(...collectProjectUrls(child));
  }
  return urls;
}
