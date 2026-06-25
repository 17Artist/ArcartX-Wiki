import { defineDocs, defineConfig, metaSchema } from 'fumadocs-mdx/config';
import { remarkMermaid } from '@theguild/remark-mermaid';
import { transformerTwoslash } from 'fumadocs-twoslash';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { z } from 'zod';
import { shimmerGrammar } from './plugin/shimmer';
import { ariaGrammar } from './plugin/aria';

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
  /**
   * 主页卡片上的标签（可多个），用来标注「开源 / 闭源 / 付费」等。
   * 每个标签：label 文字内容，color 颜色（hex，省略则用项目主题色）。
   */
  tags: z
    .array(
      z.object({
        label: z.string(),
        color: z.string().optional(),
      }),
    )
    .optional(),
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
        ariaGrammar,
        'java',
        'yaml',
        "json",
        "kotlin",
        "bash",
        "typescript",
        "groovy",
        "xml"
      ],
    },
  },
});