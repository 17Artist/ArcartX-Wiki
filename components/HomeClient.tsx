'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/* ===================================================================
 * usePrefersReducedMotion: 监听用户「减少动态」系统偏好
 * =================================================================== */

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/* ===================================================================
 * Reveal: 滚动到视口内时入场、离开后回到初始态（双向）
 * 配合 scroll-snap，每次切到这一幕都会重新播放
 * =================================================================== */

export type RevealVariant = 'fade-up' | 'fade-down' | 'scale' | 'slide-left' | 'slide-right' | 'blur';

const VARIANT_INIT: Record<RevealVariant, string> = {
  'fade-up': 'opacity-0 translate-y-6',
  'fade-down': 'opacity-0 -translate-y-6',
  'scale': 'opacity-0 scale-90',
  'slide-left': 'opacity-0 -translate-x-10',
  'slide-right': 'opacity-0 translate-x-10',
  'blur': 'opacity-0 blur-md',
};

const VARIANT_SHOWN = 'opacity-100 translate-y-0 translate-x-0 scale-100 blur-0';

export function Reveal({
  children,
  delay = 0,
  variant = 'fade-up',
  className = '',
  as: As = 'div',
  duration = 700,
}: {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
  as?: 'div' | 'section' | 'span' | 'h1' | 'h2' | 'p';
  duration?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    // 减少动态：直接显示，不做位移/缩放/模糊过渡
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        // 双向：进入触发显示，离开（小于 5% 可见）退出
        setShown(entry.isIntersecting && entry.intersectionRatio > 0.05);
      },
      { threshold: [0, 0.05, 0.2, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <As
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        transitionDelay: shown && !reduced ? `${delay}ms` : '0ms',
        transitionDuration: reduced ? '0ms' : `${duration}ms`,
      }}
      className={`
        transition-all ease-[cubic-bezier(0.22,1,0.36,1)]
        ${shown || reduced ? VARIANT_SHOWN : VARIANT_INIT[variant]}
        ${className}
      `}
    >
      {children}
    </As>
  );
}

/**
 * @deprecated 兼容现有调用，等价于 Reveal variant="fade-up"。
 */
export function FadeIn(props: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'span';
}) {
  return <Reveal {...props} variant="fade-up" />;
}

/* ===================================================================
 * Particles: 漂浮上升的霓虹光粒子（仅客户端，避免水合不一致）
 * =================================================================== */

interface Particle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
  color: string;
}

const PARTICLE_COLORS = ['#46d2ff', '#7ee7ff', '#5b8cff', '#9b6bff', '#ff5c9d'];

export function Particles({ count = 26 }: { count?: number }) {
  const [items, setItems] = useState<Particle[] | null>(null);

  useEffect(() => {
    const arr: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1.5 + Math.random() * 3,
      delay: -Math.random() * 22,
      duration: 16 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 140,
      opacity: 0.25 + Math.random() * 0.5,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }));
    setItems(arr);
  }, [count]);

  if (!items) return null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="ax-particle absolute bottom-[-10px] rounded-full"
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3.5}px ${p.color}`,
              ['--p-drift' as string]: `${p.drift}px`,
              ['--p-opacity' as string]: p.opacity,
              animation: `ax-particle-rise ${p.duration}s linear ${p.delay}s infinite`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ===================================================================
 * Hero 背景：少女夜城主视觉氛围层（fixed，铺满整页）
 * 远景城市（模糊压暗）+ 鼠标视差霓虹光晕 + 网格 + 漂浮粒子 + 暗角
 * =================================================================== */

export function HeroBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // 减少动态 / 触屏设备：不注册视差，省去整页大面积模糊层的重渲染
    if (reduced) return;
    if (window.matchMedia?.('(pointer: coarse)').matches) return;

    let raf = 0;
    let pending: MouseEvent | null = null;
    const flush = () => {
      raf = 0;
      if (!pending) return;
      const x = (pending.clientX / window.innerWidth - 0.5) * 2;
      const y = (pending.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    const handle = (e: MouseEvent) => {
      pending = e;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* 深海军蓝底色 */}
      <div className="absolute inset-0 bg-[#070b18]" />

      {/* 远景城市氛围（模糊、压暗，轻微视差） */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat opacity-[0.16] blur-2xl"
        style={{
          backgroundImage: 'url(/background/background.webp)',
          backgroundPosition: '70% 30%',
          transform: `scale(1.14) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
        }}
      />

      {/* 动态霓虹光晕 */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 青蓝主光晕（左上） */}
        <div
          className="absolute h-[900px] w-[900px] rounded-full opacity-25 transition-transform duration-[1500ms] ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(70,210,255,0.30) 0%, rgba(70,210,255,0.05) 40%, transparent 70%)',
            top: '-26%',
            left: '-12%',
            transform: `translate(${mousePos.x * 18}px, ${mousePos.y * 18}px)`,
          }}
        />
        {/* 紫罗兰副光晕（右下） */}
        <div
          className="absolute h-[720px] w-[720px] rounded-full opacity-20 transition-transform duration-[1500ms] ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(155,107,255,0.24) 0%, transparent 60%)',
            bottom: '-22%',
            right: '-8%',
            transform: `translate(${-mousePos.x * 14}px, ${-mousePos.y * 14}px)`,
          }}
        />
        {/* 品红点缀光晕（中上） */}
        <div
          className="absolute h-[520px] w-[520px] rounded-full opacity-[0.14] transition-transform duration-[1500ms] ease-out"
          style={{
            background:
              'radial-gradient(circle, rgba(255,92,157,0.20) 0%, transparent 60%)',
            top: '8%',
            left: '50%',
            transform: `translate(${mousePos.x * 8 - 260}px, ${mousePos.y * 8}px)`,
          }}
        />
      </div>

      {/* 科技网格（径向蒙版，向边缘淡出） */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(70,210,255,0.30) 1px, transparent 1px),
            linear-gradient(90deg, rgba(70,210,255,0.30) 1px, transparent 1px)
          `,
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 85%)',
        }}
      />

      {/* 漂浮光粒子 */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Particles />
      </div>

      {/* 顶部蒙版 + 整体暗角 */}
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-black/50 to-transparent" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%, transparent 52%, rgba(4,7,16,0.6) 100%)',
        }}
      />
    </div>
  );
}

/* ===================================================================
 * Hero Logo：浮动 + 青蓝辉光
 * =================================================================== */

export function HeroLogo() {
  return (
    <div className="relative inline-block animate-[hero-float_5s_ease-in-out_infinite]">
      <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-[#46d2ff]/25 blur-3xl" />
      <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-[#9b6bff]/20 blur-3xl animate-[hero-pulse_4s_ease-in-out_infinite]" />
      <img
        src="/logo.png"
        alt="ArcartX Logo"
        className="relative h-14 w-14 drop-shadow-[0_0_22px_rgba(70,210,255,0.4)] md:h-20 md:w-20"
      />
    </div>
  );
}

/* ===================================================================
 * 数字滚动 stats
 * =================================================================== */

export function CountUp({
  value,
  suffix,
  className = '',
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [val, setVal] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // 双向：可见时启动，离开时重置为 0，下次进入再次 count up
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setVisible(true);
        } else if (entry.intersectionRatio < 0.05) {
          setVisible(false);
          setVal(0);
        }
      },
      { threshold: [0, 0.05, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const duration = 1400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, value, reduced]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {reduced ? value : val}
      {suffix}
    </span>
  );
}

/* ===================================================================
 * ProjectDirectory: 紧凑卡片网格 + 搜索 + 标签筛选
 * 可扩展到几十个项目：脱离 scroll-snap，按需筛选/搜索。
 * =================================================================== */

export interface ProjectCardData {
  slug: string;
  href: string;
  title: string;
  tagline?: string;
  /** 仅用于搜索匹配，不展示 */
  description?: string;
  pageCount: number;
  color?: string;
  icon?: ReactNode;
  tags?: { label: string; color?: string }[];
}

export function ProjectDirectory({ projects }: { projects: ProjectCardData[] }) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  // 收集所有出现过的标签（去重，每个记一个代表色和项目数量）
  const allTags = useMemo(() => {
    const map = new Map<string, { color: string; count: number }>();
    for (const p of projects) {
      for (const t of p.tags ?? []) {
        const current = map.get(t.label);
        if (current) current.count += 1;
        else map.set(t.label, { color: t.color ?? p.color ?? '#46d2ff', count: 1 });
      }
    }
    return Array.from(map, ([label, value]) => ({ label, ...value }));
  }, [projects]);

  const primaryLabels = ['免费', '付费', '高级会员专属', '开源', '部分开源', '闭源'];
  const primaryTags = primaryLabels
    .map((label) => allTags.find((tag) => tag.label === label))
    .filter((tag): tag is (typeof allTags)[number] => Boolean(tag));
  const moreTags = allTags.filter((tag) => !primaryLabels.includes(tag.label));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const hitQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.tagline ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q);
      const hitTag = !activeTag || (p.tags ?? []).some((t) => t.label === activeTag);
      return hitQuery && hitTag;
    });
  }, [projects, query, activeTag]);

  const hasFilters = query.trim().length > 0 || activeTag !== null;

  const toggleTag = (label: string) => {
    setActiveTag((current) => (current === label ? null : label));
  };

  const resetFilters = () => {
    setQuery('');
    setActiveTag(null);
    setMoreOpen(false);
  };

  return (
    <div>
      {/* 搜索 + 标签筛选 */}
      <div className="mb-7 rounded-2xl border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl sm:px-4 sm:py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">搜索项目</span>
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" strokeWidth={2} />
              <path d="M21 21l-4.3-4.3" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索项目名称或用途…"
              maxLength={40}
              className="h-11 w-full rounded-xl border border-white/10 bg-[#080d1b]/50 pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-[#46d2ff]/60 focus:ring-2 focus:ring-[#46d2ff]/15 sm:h-10"
            />
          </label>

          <div className="flex min-h-10 flex-1 items-center justify-between gap-3 sm:min-h-9 sm:justify-end">
            <p className="text-xs text-white/50" aria-live="polite">
              显示 <span className="font-semibold tabular-nums text-white/80">{filtered.length}</span> / {projects.length} 个项目
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-10 rounded-lg px-3 text-xs font-medium text-[#7ee7ff] transition-colors hover:bg-[#46d2ff]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#46d2ff]/50 sm:min-h-9"
              >
                清除筛选
              </button>
            ) : null}
          </div>
        </div>

        {allTags.length > 0 ? (
          <div className="mt-2.5 border-t border-white/10 pt-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip label="全部" active={activeTag === null} onClick={() => setActiveTag(null)} />
              {primaryTags.map((tag) => (
                <FilterChip
                  key={tag.label}
                  label={tag.label}
                  color={tag.color}
                  count={tag.count}
                  active={activeTag === tag.label}
                  onClick={() => toggleTag(tag.label)}
                />
              ))}

              {moreTags.length > 0 ? (
                <button
                  type="button"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen((current) => !current)}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#46d2ff]/50 sm:min-h-9 ${
                    activeTag && moreTags.some((tag) => tag.label === activeTag)
                      ? 'border-[#46d2ff]/50 bg-[#46d2ff]/10 text-[#7ee7ff]'
                      : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {activeTag && moreTags.some((tag) => tag.label === activeTag)
                    ? `筛选：${activeTag}`
                    : `更多筛选 · ${moreTags.length}`}
                  <svg
                    className={`size-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : null}
            </div>

            {moreOpen && moreTags.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/10 p-3">
                {moreTags.map((tag) => (
                  <FilterChip
                    key={tag.label}
                    label={tag.label}
                    color={tag.color}
                    count={tag.count}
                    active={activeTag === tag.label}
                    onClick={() => {
                      toggleTag(tag.label);
                      setMoreOpen(false);
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* 网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <CompactProjectCard key={p.slug} p={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-sm text-white/50">
          没有匹配的项目，换个关键词或筛选试试。
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  color,
  count,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  const c = color ?? '#46d2ff';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#46d2ff]/50 sm:min-h-9 ${
        active
          ? 'text-[#04121d]'
          : 'border-white/15 text-white/65 hover:border-white/30 hover:text-white'
      }`}
      style={active ? { background: c, borderColor: c } : undefined}
    >
      {label}
      {count !== undefined ? (
        <span className={active ? 'text-[#04121d]/65' : 'text-white/35'}>{count}</span>
      ) : null}
    </button>
  );
}

function CompactProjectCard({ p }: { p: ProjectCardData }) {
  const accent = p.color ?? '#46d2ff';
  const allTags = p.tags ?? [];

  return (
    <Link
      href={p.href}
      className="group relative flex min-h-[132px] flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      style={{ ['--accent' as string]: accent } as React.CSSProperties}
    >
      {/* 顶部霓虹光带 */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${accent}40, 0 14px 34px -24px ${accent}88` }}
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-transform duration-200 group-hover:scale-105 [&_img]:size-7"
          style={{ color: accent, boxShadow: `0 0 18px -8px ${accent}` }}
        >
          {p.icon ?? <DefaultProjectIcon />}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="line-clamp-1 text-base font-semibold leading-snug text-white">{p.title}</h3>
          {p.tagline ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{p.tagline}</p>
          ) : null}
        </div>

        <span className="shrink-0 pt-1 text-[10px] font-medium tabular-nums text-white/45">
          {p.pageCount} 篇
        </span>
      </div>

      <div className="relative mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        {allTags.length > 0 ? (
          allTags.map((tag) => (
            <ProjectTagBadge key={tag.label} tag={tag} accent={accent} />
          ))
        ) : (
          <span className="text-xs text-white/45">项目文档</span>
        )}
      </div>
    </Link>
  );
}

function ProjectTagBadge({
  tag,
  accent,
}: {
  tag: NonNullable<ProjectCardData['tags']>[number];
  accent: string;
}) {
  const color = tag.color ?? accent;

  return (
    <span
      className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-tight"
      style={{ color, borderColor: `${color}55`, background: `${color}1f` }}
    >
      {tag.label}
    </span>
  );
}

function DefaultProjectIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h7"
      />
    </svg>
  );
}

/* ===================================================================
 * 顶部导航：滚动时玻璃化 + 青蓝边
 * =================================================================== */

export function ScrollAwareNav({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav
      className={`
        fixed inset-x-0 top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'border-b border-[#46d2ff]/15 bg-[#070b18]/75 py-3 shadow-[0_10px_40px_-18px_rgba(70,210,255,0.4)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent bg-transparent py-5'
        }
      `}
    >
      {children}
    </nav>
  );
}

/* ===================================================================
 * 移动端折叠菜单（<md 显示汉堡，承载主导航外链）
 * =================================================================== */

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? '关闭菜单' : '打开菜单'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-colors hover:border-[#46d2ff]/40 hover:text-white"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* 点击空白处关闭 */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute inset-x-4 top-full z-50 mt-3 overflow-hidden rounded-xl border border-[#46d2ff]/15 bg-[#070b18]/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            {links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-[#7ee7ff]"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-[#7ee7ff]"
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
