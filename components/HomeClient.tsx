'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';

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
 * ProjectCard: 玻璃拟态 + 3D tilt + 鼠标跟随光斑 + 霓虹辉光边
 * =================================================================== */

export function ProjectCard({
  href,
  title,
  description,
  tagline,
  pageCount,
  color,
  icon,
  updated,
  index = 0,
}: {
  href: string;
  title: string;
  description?: string;
  tagline?: string;
  pageCount: number;
  color?: string;
  icon?: ReactNode;
  updated?: string;
  index?: number;
}) {
  const accent = color ?? '#46d2ff';
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [spot, setSpot] = useState({ x: -200, y: -200 });

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // 鼠标位置 (0..1) 映射到 ±6 度倾斜
    setTilt({ rx: (py - 0.5) * -6, ry: (px - 0.5) * 6 });
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }
  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
    setSpot({ x: -200, y: -200 });
  }

  return (
    <Reveal delay={index * 90} variant="fade-up">
      <a
        ref={ref}
        href={href}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="
          group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl
          border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl
          transition-[background-color] duration-300
          hover:bg-white/[0.06]
        "
        style={
          {
            ['--accent' as string]: accent,
            transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: 'transform 200ms ease-out, background-color 300ms',
          } as React.CSSProperties
        }
      >
        {/* 顶部霓虹光带 */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-70"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
          aria-hidden
        />

        {/* hover 时的霓虹边框 + 外发光 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1px ${accent}66, 0 20px 55px -22px ${accent}88`,
          }}
          aria-hidden
        />

        {/* 跟随鼠标的光斑 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, ${accent}28, transparent 45%)`,
          }}
          aria-hidden
        />

        <div className="relative flex items-start justify-between">
          <div
            className="
              flex h-12 w-12 items-center justify-center rounded-xl
              border border-white/10 bg-white/[0.04]
              transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105
            "
            style={{
              color: accent,
              boxShadow: `0 0 22px -8px ${accent}`,
            }}
          >
            {icon ?? <DefaultProjectIcon />}
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/60">
            {pageCount} 篇
          </span>
        </div>

        <div className="relative">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {tagline ? (
            <p className="mt-1 text-xs text-white/55">{tagline}</p>
          ) : null}
        </div>

        {description ? (
          <p className="relative line-clamp-2 text-sm leading-relaxed text-white/60">
            {description}
          </p>
        ) : null}

        <div className="relative mt-auto flex items-center justify-between gap-2 pt-2 text-sm">
          <span className="flex items-center gap-1 font-medium text-white/75 transition-colors">
            <span className="transition-colors group-hover:text-[var(--accent)]">
              进入项目
            </span>
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
          {updated ? (
            <span className="text-[11px] text-white/50">文档更新于 {updated}</span>
          ) : null}
        </div>
      </a>
    </Reveal>
  );
}

function DefaultProjectIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
