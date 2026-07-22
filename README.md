# z-skill

`z-skill` 是周全个人专属的 AI 工具发布站，用于介绍和交付经过设计、整理及验证的 Skill、Workflow、Agent 与 AI 工具。

网站只承担成果说明、验证状态展示、安装提示和版本下载，不扩展为文章站、社区、用户投稿平台或排行榜。

## 当前内容

- 品牌首页 `/`；
- 可搜索、筛选和排序的工具目录 `/tools`；
- 通用工具详情路由 `/tools/[slug]`；
- 定位与收录原则 `/about`；
- Agent 安装 Prompt、ZIP 下载、版本、测试、隐私和限制说明。

正式线上地址：<https://z-skill.com/>。Cloudflare Workers 地址 <https://z-skill.zzzq8848.workers.dev/> 仅作为部署排查入口，不作为对外正式域名。

全部公开作品、当前版本与发布阶段以`/tools`及对应详情页为准，README不维护第二份作品清单或发布流水。

## 作品命名

公开界面统一使用中文正式名称；Skill文件夹、frontmatter、URL、安装调用和ZIP文件名使用英文技术标识。英文旧名和历史标识只作为搜索别名，不在卡片中重复展示。候选阶段调整技术标识时保留旧链接迁移，已经发布的ZIP不以原版本号覆盖。

`登录态网页检索 v0.1.0-candidate.3`的技术标识为`authenticated-web-search`；旧候选标识`authenticated-browser-workbench`仅用于历史搜索和链接迁移。

## 工具数据

`app/tool-data.ts` 是公开工具元数据的单一事实源。首页最近发布、目录卡片、详情页、安装 Prompt 和发布校验均从该文件读取版本、公开时间、发布阶段、分发形式、组件关系、作者、许可证、下载地址、测试、隐私与已知限制。

首页固定展示按 `releasedAt` 排序的最近三项公开版本，不随作品总量扩张；完整发现、搜索和筛选统一由 `/tools` 承担。

新增或更新工具时，应先更新工具记录和对应 ZIP，不在页面组件中重复填写版本及发布信息。

## 本地运行

本项目要求 Node.js `22.15.0` 或更高版本；Cloudflare Vite Plugin 使用该版本开始提供的同步模块钩子。

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

在Windows上，正在运行的`npm start`或`wrangler dev`可能占用`dist/server/.wrangler`。再次执行`npm run build`或`npm test`前，应先确认并停止本仓库对应的生产预览；不要结束其他项目的Node进程，也不要删除仍被占用的`dist`目录。若出现`EPERM`、`operation not permitted`或无法删除`.wrangler`，先按进程工作目录定位本仓库预览，再重试构建。

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
- 网页内容批量读取两项正式包及登录态网页检索候选包与权威源码的确定性构建结果；
- 中文展示名、技术标识、搜索别名及可用源码中的Agent界面名称；
- 已验证格式、适用场景、使用步骤、隐私与限制说明；
- 正式版／公开候选与版本号的一致性、最近发布时间和安装 Prompt 关键字段。

`npm test` 会先执行发布校验和生产构建，再运行服务端渲染测试。

渲染测试还会核对图标注册表中的每一种受控色调都存在对应CSS规则，防止新增作品时登记了颜色但生产页面退回无样式状态。

`npm run build` 本身也会先执行发布校验，因此 Cloudflare 自动构建不能绕过版本、下载包和 SHA-256 门禁。GitHub Actions 会在推送和 Pull Request 时重复运行依赖审计、测试与 ESLint；高等级依赖告警会阻止发布质量检查通过。

当前`npm audit`为零告警。Next.js与Miniflare上游仍固定了旧版PostCSS和Sharp，因此`package.json`暂用`overrides`锁定已修复的小版本；构建、渲染和Cloudflare链路必须持续通过测试。上游依赖正式纳入修复后，应移除对应override并重新生成锁文件，不得使用会把Next.js降到旧主版本的`npm audit fix --force`。

## 发布方式

站点源代码托管在 GitHub，并通过 Cloudflare Workers Builds 自动构建和发布：

- 生产分支：`main`；
- 构建命令：`npm run build`；
- 部署命令：`npx wrangler deploy`；
- 每次推送 `main` 后自动更新线上网站。

这是项目唯一的正式发布链路。本项目不使用 Codex Sites，也不保留 `.openai/hosting.json` 项目标识；除非明确迁移托管架构，否则不应重新创建 Sites 项目或恢复该绑定。

动态页面通过 `next.config.ts` 设置基础安全头，静态资源由 `_headers` 补齐；带版本号的 ZIP 下载使用长期不可变缓存和附件响应。发布前应确保发布校验、构建、渲染测试和必要的浏览器回归全部通过。正式网站已绑定独立域名`z-skill.com`，Workers地址只用于部署排查。
