import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { AIChatButton } from '@/components/AIChatButton';
import 'fumadocs-twoslash/twoslash.css';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions} sidebar={{
      footer: (
        <div >
          <div className="text-center text-sm text-gray-500 mt-1">
            <a href="https://beian.miit.gov.cn/#/Integrated/" target="_blank" rel="noopener noreferrer">沪ICP备2024096261号-4</a>
          </div>
        </div>
      ),
    }}>
      {children}
      <AIChatButton />
    </DocsLayout>
  );
}