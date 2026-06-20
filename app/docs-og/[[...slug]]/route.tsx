import { ImageResponse } from 'next/og';
import { source } from '@/lib/source';
import { getProjectFromSlugs } from '@/lib/projects';

export const dynamic = 'force-static';
export const revalidate = false;

const SIZE = { width: 1200, height: 630 };

/**
 * 为所有文档页生成 OG 图，路径形如：
 *   /docs-og              -> 序章（slug=[]）
 *   /docs-og/core/1_base  -> core 项目某页
 *
 * 在 docs page 的 generateMetadata 中通过 openGraph.images 引用这里。
 */
export async function generateStaticParams() {
  return source.generateParams();
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug);

  const project = getProjectFromSlugs(slug);
  const accent = project?.color ?? '#6366f1';
  const projectTitle = project?.title ?? 'ArcartX';

  const title = page?.data.title ?? 'ArcartX 文档中心';
  const description = page?.data.description ?? 'ArcartX 全套项目文档';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: `linear-gradient(135deg, #0b0c10 0%, ${accent}33 100%)`,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '24px',
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '4px',
              background: accent,
            }}
          />
          <span>ArcartX 文档</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: 'white', fontWeight: 600 }}>{projectTitle}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: '78px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: '32px',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.4,
                maxWidth: '900px',
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '22px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <span>wiki.arcartx.com</span>
          <span style={{ color: accent, fontWeight: 600 }}>
            {page?.url ?? '/docs'}
          </span>
        </div>
      </div>
    ),
    SIZE,
  );
}
