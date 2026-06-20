import { docs, meta } from '@/.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
  // 把 meta.json / frontmatter 中的 icon 字符串解析为 lucide-react 图标。
  // 用法：在 meta.json 写 "icon": "Sparkles"，在 mdx frontmatter 写 icon: Sparkles。
  icon(icon) {
    if (!icon) return undefined;
    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }
    return undefined;
  },
});
