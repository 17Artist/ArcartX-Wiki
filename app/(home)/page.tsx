import Link from 'next/link';
import { getProjects } from '@/lib/projects';
import {
  HeroBackground,
  HeroLogo,
  ProjectDirectory,
  ScrollAwareNav,
  MobileMenu,
  Reveal,
  CountUp,
  type NavLink,
  type ProjectCardData,
} from '@/components/HomeClient';
import { SnapBoot } from '@/components/SnapBoot';

const QQ_GROUP_URL =
  'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bq2Egfr376H6Tp_2KCfcbDzI2IRndERq&authKey=ffKd3oo4B9GOUjt70TDo7J9Z2NTcGVz5CiTigJEPwA%2FUX0CLSO9ZM%2FVvPi8hLtfo&noverify=0&group_code=832063293';
const COMMUNITY_URL = 'https://arcartx.com/';
const AFDIAN_URL = 'https://afdian.com/a/arcartx/';

// 每一幕（section）= 一屏视口高度，scroll-snap 吸附到顶。
// 用 100svh（小视口高度单位）避免移动端地址栏伸缩导致的高度抖动。
// fixed footer 是半透明的，会浮在每幕之上，因此不用为它扣高度。
const SECTION_CLASS =
  'relative flex min-h-[100svh] items-center px-6 py-16 md:py-20 snap-section';

export default function HomePage() {
  const projects = getProjects();
  const totalPages = projects.reduce((sum, p) => sum + p.pageCount, 0);
  const firstEntry = projects[0]?.entry ?? '/';

  const navLinks: NavLink[] = [
    { label: '文档', href: firstEntry },
    { label: '社区', href: COMMUNITY_URL, external: true },
    { label: 'QQ 群', href: QQ_GROUP_URL, external: true },
    { label: '爱发电', href: AFDIAN_URL, external: true },
  ];

  const projectCards: ProjectCardData[] = projects.map((p) => ({
    slug: p.slug,
    href: p.entry,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    pageCount: p.pageCount,
    color: p.color,
    icon: p.icon,
    tags: p.tags,
  }));

  return (
    <main className="relative overflow-x-clip text-white">
      <SnapBoot />
      <HeroBackground />

      {/* ============ 顶部导航 ============ */}
      <ScrollAwareNav>
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ArcartX"
              className="h-9 w-9 drop-shadow-[0_0_12px_rgba(70,210,255,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
            <span className="translate-y-[3px] bg-gradient-to-r from-white to-[#7ee7ff]/70 bg-clip-text text-lg font-bold leading-none tracking-tight text-transparent">
              ArcartX
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {navLinks.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 transition-colors hover:text-[#7ee7ff]"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-white/60 transition-colors hover:text-[#7ee7ff]"
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={firstEntry}
              className="
                group relative hidden overflow-hidden rounded-lg sm:inline-flex
                bg-gradient-to-r from-[#2bb6f0] to-[#46d2ff] px-4 py-1.5 text-sm font-semibold text-[#04121d]
                transition-all hover:shadow-lg hover:shadow-[#46d2ff]/30
              "
            >
              <span className="relative z-10">开始使用</span>
              <span
                className="
                  absolute inset-0 -translate-x-full bg-gradient-to-r
                  from-transparent via-white/40 to-transparent
                  transition-transform duration-700
                  group-hover:translate-x-full
                "
                aria-hidden
              />
            </Link>
            <MobileMenu links={navLinks} />
          </div>
        </div>
      </ScrollAwareNav>

      {/* ============ 第一幕：Hero（少女夜城主视觉） ============ */}
      <section className="relative flex min-h-[100svh] items-start px-6 pt-24 pb-16 snap-section sm:px-8 md:items-center md:py-20 lg:px-12">
        {/* 主视觉背景图：人物在右，文案在左 */}
        <div className="absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: 'url(/background/background.webp)',
              backgroundPosition: '72% 30%',
            }}
          />
          {/* 桌面：左暗右清，文案区可读、右侧人物霓虹尽量保留 */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-[#070b18] via-[#070b18]/90 via-[50%] to-transparent to-[64%] md:block" />
          {/* 移动：整体中等压暗（保留人物为氛围）+ 底部加深承托文案 */}
          <div className="absolute inset-0 bg-[#070b18]/45 md:hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b18] via-[#070b18]/30 to-transparent md:hidden" />
          {/* 顶部给导航留白、底部融入下一幕 */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#070b18]/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070b18] to-transparent" />
        </div>

        {/* HUD 角标装饰 */}
        <HudCorners />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left">
            <Reveal variant="fade-down">
              <HeroLogo />
            </Reveal>

            <Reveal delay={120} variant="fade-up">
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#46d2ff]/30 bg-[#46d2ff]/[0.07] px-3.5 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#46d2ff] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#46d2ff]" />
                </span>
                <span className="text-xs font-medium tracking-[0.18em] text-[#9fe9ff]">
                  ARCARTX DOCUMENTATION
                </span>
              </div>
            </Reveal>

            <Reveal delay={200} variant="fade-up">
              <h1 className="mt-5 bg-gradient-to-br from-white via-[#d6f1ff] to-[#7ee7ff] bg-clip-text text-5xl font-black leading-[1.05] tracking-tight text-transparent drop-shadow-[0_2px_30px_rgba(70,210,255,0.25)] md:text-7xl">
                ArcartX
                <br />
                文档中心
              </h1>
            </Reveal>

            <Reveal delay={300} variant="fade-up">
              <p className="mt-5 text-lg text-white/80 md:text-xl">
                一起前往{' '}
                <span className="bg-gradient-to-r from-[#7ee7ff] to-[#9b6bff] bg-clip-text font-semibold text-transparent">
                  更遥远的未来
                </span>
              </p>
            </Reveal>

            <Reveal delay={420} variant="fade-up">
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:justify-start">
                <Link
                  href={firstEntry}
                  className="
                    group relative inline-flex items-center gap-2 overflow-hidden rounded-xl
                    bg-gradient-to-r from-[#2bb6f0] to-[#46d2ff] px-7 py-3.5
                    text-base font-bold text-[#04121d]
                    shadow-[0_0_32px_-6px_rgba(70,210,255,0.65)]
                    transition-all duration-300
                    hover:scale-[1.03] hover:shadow-[0_0_44px_-2px_rgba(70,210,255,0.8)]
                  "
                >
                  <span className="relative z-10">立即开始</span>
                  <svg
                    className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1"
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
                  <span
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                    aria-hidden
                  />
                </Link>

                <a
                  href={COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5
                    px-7 py-3.5 text-base font-medium text-white/85
                    backdrop-blur-sm transition-all duration-300
                    hover:scale-[1.03] hover:border-[#46d2ff]/40 hover:bg-white/10 hover:text-white
                  "
                >
                  探索社区
                </a>
              </div>
            </Reveal>

            {/* stats 行 */}
            <Reveal delay={540} variant="fade-up">
              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 md:mt-14 md:grid-cols-4">
                <Stat value={projects.length} label="独立项目" />
                <Stat value={totalPages} label="文档篇数" />
                <Stat value={100} label="内置函数" suffix="+" />
                <Stat value={365} label="持续支持" suffix=" 天" />
              </div>
            </Reveal>
          </div>
        </div>

        {/* 向下指示（桌面端） */}
        <div className="absolute inset-x-0 bottom-8 z-10 hidden justify-center md:flex">
          <div className="animate-[ax-hint-bounce_2s_ease-in-out_infinite] text-[#46d2ff]/50">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ============ 第二幕：项目目录（脱离 snap、可滚动浏览几十个项目） ============ */}
      <section className="relative min-h-[100svh] px-6 pt-24 pb-20 snap-section sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <Reveal variant="slide-right">
            <div className="mb-10 text-center md:mb-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7ee7ff]">
                Project Directory
              </p>
              <h2 className="bg-gradient-to-b from-white to-[#7ee7ff]/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                项目目录
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
                ArcartX 以及同作者生态系列产品。
              </p>
            </div>
          </Reveal>

          {projectCards.length > 0 ? (
            <ProjectDirectory projects={projectCards} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-sm text-white/60">
              暂无项目，请在 content/docs 下创建项目目录并在 meta.json 设置 root: true
            </div>
          )}
        </div>
      </section>

      {/* ============ 第三幕：社区 ============ */}
      <section className={SECTION_CLASS}>
        <div className="mx-auto w-full max-w-5xl">
          <Reveal variant="blur">
            <div className="mb-12 text-center md:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7ee7ff]">
                Community
              </p>
              <h2 className="bg-gradient-to-b from-white to-[#7ee7ff]/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                加入社区
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-white/60 md:text-base">
                与其他开发者交流经验，获取帮助，分享您的作品。
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            <CommunityCard
              delay={0}
              href={QQ_GROUP_URL}
              icon={<IconChat />}
              title="QQ 交流群"
              desc="实时交流，快速获取帮助"
              hoverColor="#46d2ff"
            />
            <CommunityCard
              delay={120}
              href={COMMUNITY_URL}
              icon={<IconGlobe />}
              title="官方社区"
              desc="浏览资源，分享作品"
              hoverColor="#9b6bff"
            />
            <CommunityCard
              delay={240}
              href={AFDIAN_URL}
              icon={<IconHeart />}
              title="支持我们"
              desc="您的支持是我们前进的动力"
              hoverColor="#ff5c9d"
            />
          </div>
        </div>
      </section>

      {/* ============ 第四幕：末尾 CTA ============ */}
      <section className={SECTION_CLASS}>
        <div className="mx-auto w-full max-w-3xl text-center">
          <Reveal variant="scale">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7ee7ff]">
              Get Started
            </p>
            <h2 className="bg-gradient-to-b from-white to-[#7ee7ff]/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
              准备好了吗？
            </h2>
            <p className="mt-4 text-base text-white/65 md:text-lg">
              现在就开始，为您的服务器注入新的活力
            </p>
            <div className="mt-10">
              <Link
                href={firstEntry}
                className="
                  group inline-flex items-center gap-3 rounded-xl
                  bg-gradient-to-r from-[#2bb6f0] to-[#46d2ff] px-8 py-4 text-lg font-bold text-[#04121d]
                  shadow-[0_0_40px_-6px_rgba(70,210,255,0.6)] transition-all duration-300
                  hover:scale-[1.04] hover:shadow-[0_0_56px_-4px_rgba(70,210,255,0.78)]
                "
              >
                查看文档
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

/* ===================== 内部小组件 ===================== */

function HudCorners() {
  const base =
    'pointer-events-none absolute hidden h-8 w-8 border-[#46d2ff]/30 md:block';
  return (
    <div aria-hidden>
      <span className={`${base} left-5 top-24 border-l border-t`} />
      <span className={`${base} right-5 top-24 border-r border-t`} />
      <span className={`${base} bottom-20 left-5 border-b border-l`} />
      <span className={`${base} bottom-20 right-5 border-b border-r`} />
    </div>
  );
}

function Stat({
  value,
  label,
  suffix,
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="text-center md:text-left">
      <div className="whitespace-nowrap text-3xl font-bold text-[#7ee7ff] drop-shadow-[0_0_18px_rgba(70,210,255,0.3)] md:text-4xl">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="mt-1.5 text-xs text-white/60 md:text-sm">{label}</div>
    </div>
  );
}

function CommunityCard({
  href,
  icon,
  title,
  desc,
  hoverColor,
  delay,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  hoverColor: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} variant="fade-up">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="
          group relative block overflow-hidden rounded-2xl border border-white/10
          bg-white/[0.035] p-7 backdrop-blur-xl transition-all duration-300
          hover:-translate-y-1 hover:bg-white/[0.06]
        "
        style={{ ['--hover' as string]: hoverColor } as React.CSSProperties}
      >
        <div
          className="
            absolute inset-0 opacity-0 transition-opacity duration-500
            group-hover:opacity-100
          "
          style={{
            background: `radial-gradient(500px circle at 50% 0%, color-mix(in srgb, ${hoverColor} 22%, transparent), transparent 60%)`,
          }}
          aria-hidden
        />
        {/* hover 霓虹边 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${hoverColor}55, 0 20px 50px -24px ${hoverColor}88` }}
          aria-hidden
        />
        <div className="relative">
          <div
            className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
            style={{ color: hoverColor, filter: `drop-shadow(0 0 12px ${hoverColor}40)` }}
          >
            {icon}
          </div>
          <h3 className="mb-1.5 text-lg font-semibold text-white">
            <span className="group-hover:text-[var(--hover)]">{title}</span>
          </h3>
          <p className="text-sm text-white/60">{desc}</p>
        </div>
      </a>
    </Reveal>
  );
}

/* ===================== 社区卡片：手写线性 SVG 图标 ===================== */

const SVG_PROPS = {
  className: 'h-9 w-9',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/** 聊天气泡 + 三个点（QQ 交流群） */
function IconChat() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M20.5 11.4c0 4.1-3.8 7.5-8.5 7.5-1.1 0-2.1-.2-3-.5L4 20l1.5-4.2a7 7 0 0 1-2-4.4C3.5 7.3 7.3 3.9 12 3.9s8.5 3.4 8.5 7.5Z" />
      <circle cx="8.5" cy="11.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="11.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 地球（官方社区） */
function IconGlobe() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
    </svg>
  );
}

/** 爱心（支持我们） */
function IconHeart() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M12 20.5C12 20.5 3.8 15.3 3.8 9.3C3.8 6.6 5.9 4.8 8.1 4.8C9.8 4.8 11.2 5.8 12 7.2C12.8 5.8 14.2 4.8 15.9 4.8C18.1 4.8 20.2 6.6 20.2 9.3C20.2 15.3 12 20.5 12 20.5Z" />
    </svg>
  );
}
