'use client';

import { RootProvider } from 'fumadocs-ui/provider';
import dynamic from 'next/dynamic';
import { useMemo, type ReactNode } from 'react';
import type { SharedProps } from 'fumadocs-ui/components/dialog/search';
import type { SearchScopeProject } from './SearchDialogWithScope';

const SearchDialog = dynamic(() => import('./SearchDialogWithScope'), { ssr: false });

/**
 * 客户端 Provider 包装：注入项目元数据到搜索对话框，使搜索可按项目范围过滤。
 *
 * 用法：在 root layout 用此组件替换 fumadocs-ui 的 RootProvider。
 */
export function AppRootProvider({
  children,
  scopeProjects,
}: {
  children: ReactNode;
  scopeProjects: SearchScopeProject[];
}) {
  const ScopedSearchDialog = useMemo(() => {
    const Wrapper = (props: SharedProps) => (
      <SearchDialog {...props} scopeProjects={scopeProjects} />
    );
    Wrapper.displayName = 'ScopedSearchDialog';
    return Wrapper;
  }, [scopeProjects]);

  return (
    <RootProvider
      theme={{
        enabled: false,
        defaultTheme: 'dark',
      }}
      search={{
        SearchDialog: ScopedSearchDialog,
      }}
    >
      {children}
    </RootProvider>
  );
}
