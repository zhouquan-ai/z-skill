import type { ToolRecord } from "../tool-data";

export const weixinArticleReader: ToolRecord = {
  slug: "weixin-article-reader",
  name: "微信公众号文章读取",
  aliases: ["Weixin Article Reader", "weixin-article-reader"],
  iconKey: "article-read",
  iconTone: "teal",
  type: "Skill",
  packageMode: "Standalone",
  status: "正式版",
  statusTone: "stable",
  version: "v0.1.0",
  releasedAt: "2026-07-14T12:02:00+08:00",
  updated: "2026-07-19",
  author: "周全",
  license: "MIT",
  category: "信息获取 · 微信公众号",
  summary: "批量读取微信公众号文章，保留正文、元数据和逐篇状态。",
  detailSummary: "面向微信公众号完整分享链接的独立读取Skill，支持批量处理与失败回退。",
  environments: ["Codex"],
  environmentNote: "Codex · Windows PowerShell",
  download: {
    path: "/downloads/weixin-article-reader-v0.1.0.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/weixin-article-reader-v0.1.0.zip",
    label: "下载 Skill ZIP",
    fileType: "ZIP",
    sha256: "94f5c4ae0f9e0022a8e3436460ee9bae53965ca710cc35193cb770c7e3601084",
  },
  overview: {
    title: "只安装公众号文章读取能力",
    description:
      "Skill接收单条或批量微信公众号文章链接，优先使用OpenCLI专用适配器，必要时进入BrowserAct只读回退，并统一记录正文和元数据状态。",
    scenarios: [
      "批量保存公众号文章正文",
      "比较多篇公众号文章的内容与写法",
      "为研究或知识库准备带元数据的Markdown",
      "单独使用公众号能力，不安装完整网页Workflow",
    ],
  },
  testNote: "微信公众号完整分享链接7篇样本7/7；Codex实际触发的默认混合批次中公众号路径成功，BrowserAct单篇回退与批量清单已验证。",
  formatTests: [
    { format: "完整分享链接", status: "verified", label: "7篇样本7/7" },
    { format: "批量读取与去重", status: "verified", label: "当前样本已验证" },
    { format: "OpenCLI主路径", status: "verified", label: "当前样本已验证" },
    { format: "BrowserAct回退", status: "verified", label: "单篇样本已验证" },
    { format: "短链接", status: "pending", label: "应保留完整参数" },
  ],
  usageSteps: [
    "解压 ZIP，先阅读隐私说明和已知限制。",
    "把 skill/weixin-article-reader 复制到当前 Agent 的 skills 目录。",
    "确认 OpenCLI 微信公众号适配器可用；BrowserAct只作为可选回退。",
    "提供完整分享链接运行脚本，并检查 manifest.json。",
  ],
  install: {
    intro: "这是可独立安装的公众号文章读取Skill，也包含在网页内容批量读取 Workflow中。",
    steps: [
      "下载并解压 v0.1.0 Skill ZIP，阅读 README.md、PRIVACY.md、KNOWN_LIMITATIONS.md 和 COMPONENTS.json。",
      "将 skill/weixin-article-reader 复制到当前 Agent 的 skills 目录。",
      "确认 OpenCLI 微信公众号适配器可用；需要回退时再配置 BrowserAct。",
      "不要写入 API Key、Cookie 或浏览器 Profile。",
      "使用无敏感信息的完整分享链接做最小测试，并检查 manifest.json。",
    ],
    fallback: "OpenCLI不可用时，可在已配置BrowserAct的环境中使用只读回退路径。",
  },
  components: [],
  dependencies: [
    { name: "Windows PowerShell", role: "当前执行环境" },
    { name: "OpenCLI", role: "公众号主路径" },
    { name: "BrowserAct", role: "可选回退" },
  ],
  privacy:
    "BrowserAct远程回退会把公开URL交给第三方服务。不要提交私有链接、敏感查询参数、Cookie或浏览器Profile。",
  limitations:
    "短链接或被截断的分享参数可能读取失败；BrowserAct回退结果可能缺少元数据或混入附属内容。当前主要验证Windows PowerShell环境。",
};
