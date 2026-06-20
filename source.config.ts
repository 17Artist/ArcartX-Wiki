import { defineDocs, defineConfig, metaSchema } from 'fumadocs-mdx/config';
import { remarkMermaid } from '@theguild/remark-mermaid';
import { transformerTwoslash } from 'fumadocs-twoslash';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { z } from 'zod';
import { shimmerGrammar } from './plugin/shimmer';

// 扩展 meta.json 的 schema，让项目根目录可以声明额外的「项目元信息」
// 这些字段供 lib/projects.ts、主页、RootToggle 读取。
const projectMetaSchema = metaSchema.extend({
  /** 主题色（CSS 颜色值） */
  color: z.string().optional(),
  /** 项目首页路径（不含 /docs/ 前缀），如 "core/1_base/1_setup" */
  entry: z.string().optional(),
  /** 项目副标题（主页卡片用） */
  tagline: z.string().optional(),
  /** 排序权重（升序），未填默认 999 */
  order: z.number().optional(),
  /** 暂时隐藏，不出现在主页和 RootToggle */
  hidden: z.boolean().optional(),
});

export const { docs, meta } = defineDocs({
  dir: 'content/docs',
  meta: {
    schema: projectMetaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMermaid],
    rehypeCodeOptions: {
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash(),
      ],
      inline: 'tailing-curly-colon',
      langs: [
        shimmerGrammar,
        'java',
        'yaml',
        "json",
        "kotlin"
      ],
    },
  },
});