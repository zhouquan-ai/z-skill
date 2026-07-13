# z-skill

`z-skill` 是周全个人专属的 AI 工具发布站，用于介绍和交付经过设计、整理及验证的 Skill、Workflow、Agent 与 AI 工具。

网站只承担成果说明、验证状态展示、安装提示和版本下载，不扩展为文章站、社区、用户投稿平台或排行榜。

## 当前内容

- 品牌首页 `/`；
- 可搜索、筛选和排序的工具目录 `/tools`；
- 通用工具详情路由 `/tools/[slug]`；
- 定位与收录原则 `/about`；
- Any-to-MD `v0.1.0-candidate` 详情、Agent 安装 Prompt 和 ZIP 下载。

当前临时线上地址：<https://z-skill.zzzq8848.workers.dev/>。该地址含账户标识，不作为最终正式域名。

## 工具数据

`app/tool-data.ts` 是公开工具元数据的单一事实源。首页代表工具、目录卡片、详情页、安装 Prompt 和发布校验均从该文件读取版本、状态、作者、许可证、下载地址、测试、隐私与已知限制。

新增或更新工具时，应先更新工具记录和对应 ZIP，不在页面组件中重复填写版本及发布信息。

## 本地运行

```bash
npm install
npm run dev
```

如需按 Cloudflare Worker 的实际资源挂载方式预览生产构建：

```bash
npm run build
npm start
```

`npm start` 使用构建产物中的 Wrangler 配置，同时加载服务端代码、样式、脚本和下载资源；不要用只启动应用服务的方式代替生产预览。

## 验证

```bash
npm run validate:release
npm test
npm run lint
npm run audit
```

`validate:release` 会检查：

- 工具必填信息和唯一性；
- 版本与 ZIP 文件名；
- 网站下载路径与 GitHub 权威地址；
- ZIP 文件存在性、文件签名和 SHA-256；
- 已验证格式、适用场景、使用步骤、隐私与限制说明；
- 首页代表工具数量和安装 Prompt 关键字段。

`npm test` 会先执行发布校验和生产构建，再运行服务端渲染测试。

`npm run build` 本身也会先执行发布校验，因此 Cloudflare 自动构建不能绕过版本、下载包和 SHA-256 门禁。GitHub Actions 会在推送和 Pull Request 时重复运行依赖审计、测试与 ESLint；高等级依赖告警会阻止发布质量检查通过。

当前依赖审计仅保留 Next.js 内嵌 PostCSS 的中等级上游提示。该问题要求把不受信任的 CSS 解析后重新嵌入 HTML，而本站不接收、解析或展示用户提交的 CSS，因此当前没有对应输入面。`npm audit fix --force` 会把 Next.js 错降到不兼容的旧版本，不应执行；后续在 Next.js 提供兼容修复时随正常依赖维护更新。

## 发布方式

站点源代码托管在 GitHub，并通过 Cloudflare Workers Builds 自动构建和发布：

- 生产分支：`main`；
- 构建命令：`npm run build`；
- 部署命令：`npx wrangler deploy`；
- 每次推送 `main` 后自动更新线上网站。

动态页面通过 `next.config.ts` 设置基础安全头，静态资源由 `_headers` 补齐；带版本号的 ZIP 下载使用长期不可变缓存和附件响应。发布前应确保发布校验、构建、渲染测试和必要的浏览器回归全部通过。正式网站后续绑定不含账户标识的独立域名。
