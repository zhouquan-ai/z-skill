# z-skill

`z-skill` 是周全设计的 AI 工具与可复用工作流下载站，聚焦 Skill、Workflow、Agent 与实用工具。

网站只承担成果介绍、验证状态展示和版本下载，不扩展为文章站、社区或用户投稿平台。

## 当前内容

- Any-to-MD `v0.1.0-candidate`；
- 首页工具目录、类型筛选与搜索；
- Any-to-MD 详情页；
- 候选版 ZIP 直接下载。

## 本地运行

```bash
npm install
npm run dev
```

## 验证

```bash
npm run build
```

## 发布方式

站点源代码托管在 GitHub，并通过 Cloudflare Workers Builds 自动构建和发布：

- 生产分支：`main`；
- 构建命令：`npm run build`；
- 部署命令：`npx wrangler deploy`；
- 每次推送 `main` 后自动更新线上网站。

正式网站使用独立域名，不以 GitHub 用户名作为网站地址。
