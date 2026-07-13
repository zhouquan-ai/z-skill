# Web Content Reader

Web Content Reader 是一套批量读取微信公众号文章和普通公开网页的 Workflow 内部候选包。它包含两个 Skill：

- `web-content-reader`：识别网页类型，组织正文提取、浏览器回退和结果验收；
- `weixin-article-reader`：处理微信公众号文章，优先使用 OpenCLI 专用适配器，失败时使用 BrowserAct 只读提取。

## 安装

1. 将 `skill/web-content-reader` 与 `skill/weixin-article-reader` 复制到当前 Agent 认可的 skills 目录。
2. 在 Windows PowerShell 环境中确认脚本可以解析。
3. 根据需要安装依赖：
   - OpenCLI：微信公众号专用主路径；
   - `uv tool install trafilatura`：普通静态网页正文提取与渲染结果清洗；
   - BrowserAct：本地浏览器和远程只读渲染备用路径。
4. BrowserAct 的 API Key、浏览器和其他账户配置由使用者自行完成，不写入本包。
5. 如需使用BrowserAct本地浏览器，运行脚本时传入`-BrowserName`，或设置`BROWSERACT_BROWSER_NAME`环境变量。

依赖不齐全时，Workflow会跳过不可用的路径，但不能保证剩余路径足以读取目标页面。安装和配置第三方工具前，应分别查看其官方说明、许可证和数据处理规则。

## 最小用法

```powershell
& "skills/web-content-reader/scripts/batch_web_content.ps1" `
  -Urls @(
    "https://mp.weixin.qq.com/s/example",
    "https://example.com/article"
  ) `
  -OutputDirectory ".\web-reading-output"
```

运行结束后读取输出目录中的`manifest.json`，逐篇检查`Status`、`Method`、`Attempts`、`RouteHistory`、`ContentScope`、`Warning`和`Error`。退出码正常不等于正文一定完整。

## 版本状态

当前 Workflow 版本为`v0.2.0-candidate.1`，内含`Weixin Article Reader v0.1.0-candidate.1`。本目录是内部候选源码，尚未进入z-skill公开目录。测试范围与失败情况见`TEST_MATRIX.md`和`KNOWN_LIMITATIONS.md`。本包不包含API Key、Cookie、浏览器Profile、代理服务或任何登录信息。

在z-skill仓库根目录运行`npm run build:web-reader`，可以从同一份Skill源码生成Workflow Bundle和Weixin Skill独立候选包。构建结果写入未纳入Git的`outputs/web-content-reader/`。
