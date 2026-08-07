import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  // 生产构建与开发服务器使用不同目录，避免两者争用 .next。
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'production' ? '.next-build' : '.next'),
  // /docs 不展示目录列表，永远跳到主页（多项目入口）
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default withMDX(config);
