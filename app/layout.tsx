import './global.css';
import type { ReactNode } from 'react';
import { Metadata } from 'next';
import { getProjects, getProjectThemeMap } from '@/lib/projects';
import { ProjectThemeBoot } from '@/components/ProjectThemeBoot';
import { AppRootProvider } from '@/components/AppRootProvider';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'ArcartX —— 文档中心',
  icons: {
    icon: { url: '/favicon.ico' },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  const projectThemes = getProjectThemeMap();
  const scopeProjects = getProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    color: p.color,
  }));

  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen pb-9">
        <AppRootProvider scopeProjects={scopeProjects}>
          <ProjectThemeBoot map={projectThemes} />
          {children}
          <SiteFooter />
        </AppRootProvider>
      </body>
    </html>
  );
}
