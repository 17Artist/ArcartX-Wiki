# ArcartX Wiki

欢迎提交 Pull Request 来更新、纠错文档或分享使用技巧！

ArcartX 官方文档站，基于 [Fumadocs](https://fumadocs.vercel.app) + Next.js 构建。

部分内容为AI自动生成，如遇错误可到社区提交/PR提交修正


## 在线访问

[wiki.arcartx.com](https://wiki.arcartx.com)

## 参与贡献

我们非常欢迎社区贡献，您可以通过 PR 来：

- 修正文档中的错误或过时内容
- 补充遗漏的功能说明或参数描述
- 分享实用技巧、最佳实践或配置示例
- 改进文档的表述和可读性

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 http://localhost:3000 预览。

### 文档结构

```
content/docs/
├── core/           # 核心功能文档
├── server_api/     # 服务端插件 API
├── shimmer/        # Shimmer 脚本语言
└── ...
```

文档使用 `.mdx` 格式编写，支持 Markdown + React 组件。

## 技术栈

- [Next.js 15](https://nextjs.org)
- [Fumadocs](https://fumadocs.vercel.app)
- [Tailwind CSS](https://tailwindcss.com)

## 许可证

本文档内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议授权。
