import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Popup, PopupContent, PopupTrigger } from 'fumadocs-twoslash/ui';
import { NietzscheQuote } from '@/components/NietzscheQuote';
import { BASE_URL } from '@/lib/site';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage 
    tableOfContent={{
      style: 'clerk',
    }}
    toc={page.data.toc} 
    full={page.data.full}
    >
      <NietzscheQuote />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody >
        <MDX components={{ 
          ...defaultMdxComponents,
            Tabs,
            Tab,
            TypeTable,
            Popup,
            PopupContent,
            PopupTrigger,
            Callout,
            Accordion,
            Accordions,
         }} />
      </DocsBody>
      
    </DocsPage >
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // OG image：全站统一的静态品牌图（避免动态渲染中文所需的字体依赖）
  const ogUrl = `${BASE_URL}/og.jpg`;

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      siteName: 'ArcartX 文档中心',
      type: 'article',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: page.data.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
      images: [ogUrl],
    },
  };
}


