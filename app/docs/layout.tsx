import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { getRootToggleOptions } from '@/lib/projects';
import 'fumadocs-twoslash/twoslash.css';

export default function Layout({ children }: { children: ReactNode }) {
  const tabs = getRootToggleOptions();

  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      sidebar={{
        tabs,
      }}
    >
      {children}
    </DocsLayout>
  );
}
