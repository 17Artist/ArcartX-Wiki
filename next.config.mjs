import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
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
