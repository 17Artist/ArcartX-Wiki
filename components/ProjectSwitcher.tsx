'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';

export interface ProjectSwitcherOption {
  slug: string;
  title: string;
  description?: string;
  url: string;
  urls: string[];
  color?: string;
  icon?: ReactNode;
}

export function ProjectSwitcher({ options }: { options: ProjectSwitcherOption[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () =>
      options.findLast(
        (option) =>
          option.urls.includes(pathname) || pathname.startsWith(`/docs/${option.slug}/`),
      ),
    [options, pathname],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    return options.filter((option) => {
      if (option.slug === selected?.slug) return false;
      if (!normalized) return true;
      return `${option.title} ${option.description ?? ''}`
        .toLocaleLowerCase('zh-CN')
        .includes(normalized);
    });
  }, [options, query, selected?.slug]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  if (!selected) return null;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery('');
      }}
    >
      <PopoverTrigger
        className="group -mx-2 flex min-h-12 w-[calc(100%+1rem)] items-center gap-2.5 rounded-lg border border-fd-border/70 bg-fd-muted/30 px-2.5 py-1.5 text-left transition-colors hover:border-fd-border hover:bg-fd-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
        aria-label={`当前文档：${selected.title}，点击切换文档`}
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-fd-border/70 bg-fd-background/70 [&_img]:size-6"
          style={{ color: selected.color }}
        >
          {selected.icon ?? <DefaultProjectIcon />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-fd-muted-foreground">
            当前文档
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-fd-foreground">
            {selected.title}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(440px,calc(100vw-24px))] overflow-hidden rounded-xl border-fd-border/80 bg-fd-popover/95 p-0 shadow-xl backdrop-blur-xl"
      >
        <div className="border-b border-fd-border/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-semibold text-fd-foreground">选择文档</p>
              <p className="text-xs text-fd-muted-foreground">
                另有 {Math.max(options.length - 1, 0)} 个项目
              </p>
            </div>
            <Link
              href="/#projects"
              onClick={close}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-fd-primary transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
            >
              查看目录
            </Link>
          </div>

          <label className="relative block">
            <span className="sr-only">搜索项目</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fd-muted-foreground" />
            <input
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索项目名称或说明…"
              maxLength={40}
              className="h-10 w-full rounded-lg border border-fd-border bg-fd-background/70 pl-9 pr-3 text-sm text-fd-foreground outline-none placeholder:text-fd-muted-foreground focus:border-fd-primary/60 focus:ring-2 focus:ring-fd-ring/30"
            />
          </label>
        </div>

        <div className="max-h-[min(420px,calc(100vh-190px))] overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {filtered.map((option) => (
                <Link
                  key={option.slug}
                  href={option.url}
                  onClick={close}
                  className="group/item flex min-h-14 items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring"
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-md border border-fd-border/70 bg-fd-background/60 [&_img]:size-5"
                    style={{ color: option.color }}
                  >
                    {option.icon ?? <DefaultProjectIcon />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fd-foreground">
                      {option.title}
                    </span>
                    {option.description ? (
                      <span className="mt-0.5 block truncate text-[11px] text-fd-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-fd-foreground">没有匹配的项目</p>
              <p className="mt-1 text-xs text-fd-muted-foreground">换个关键词试试。</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="11" cy="11" r="7" strokeWidth={2} />
      <path d="m20 20-3.5-3.5" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DefaultProjectIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h7" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
