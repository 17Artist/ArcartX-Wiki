'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import DefaultSearchDialog, {
  type DefaultSearchDialogProps,
} from 'fumadocs-ui/components/dialog/search-default';
import type { TagItem } from 'fumadocs-ui/components/dialog/tag-list';

export interface SearchScopeProject {
  slug: string;
  title: string;
  color?: string;
}

export interface SearchDialogWithScopeProps extends DefaultSearchDialogProps {
  /** 由 server 端注入的项目列表（来自 lib/projects） */
  scopeProjects: SearchScopeProject[];
}

/**
 * 包装 fumadocs DefaultSearchDialog，按当前 pathname 推断默认搜索范围（tag）。
 * tag 与 /api/search?tag=<slug> 对接，由 app/api/search/route.ts 负责过滤。
 */
export default function SearchDialogWithScope({
  scopeProjects,
  ...props
}: SearchDialogWithScopeProps) {
  const pathname = usePathname();

  const currentSlug = useMemo(() => {
    const m = pathname.match(/^\/docs\/([^/]+)/);
    return m?.[1];
  }, [pathname]);

  const tags = useMemo<TagItem[]>(() => {
    return scopeProjects.map((p) => ({ name: p.title, value: p.slug }));
  }, [scopeProjects]);

  return (
    <DefaultSearchDialog
      {...props}
      tags={tags}
      defaultTag={currentSlug}
      allowClear
    />
  );
}
