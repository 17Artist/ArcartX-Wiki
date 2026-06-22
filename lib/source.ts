import { docs, meta } from '@/.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

/** 图片图标后缀（视为 public 目录下的静态资源） */
const IMAGE_ICON = /\.(png|svg|jpe?g|webp|gif)$/i;

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
  // meta.json / frontmatter 的 icon 支持两种写法：
  //  1. lucide-react 图标名，如  "icon": "Sparkles"
  //  2. public 目录下的图片路径，如  "icon": "icons/v2.png"  或  "icon": "/logo.svg"
  //     （支持 png / svg / jpg / webp / gif；相对写法会自动补成根路径）
  icon(icon) {
    if (!icon) return undefined;

    // 图片路径：以 "/" 开头，或带图片后缀
    if (icon.startsWith('/') || IMAGE_ICON.test(icon)) {
      const src = icon.startsWith('/') ? icon : '/' + icon.replace(/^\.?\/+/, '');
      return createElement('img', {
        src,
        alt: '',
        'aria-hidden': true,
        className: 'h-6 w-6 shrink-0 object-contain',
      });
    }

    // lucide-react 图标名
    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }
    return undefined;
  },
});
