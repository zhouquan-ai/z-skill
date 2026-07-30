import type { ToolRecord } from "../tool-data";

export const webContentReader: ToolRecord = {
  slug: "web-content-reader",
  name: "网页内容批量读取",
  aliases: ["Web Content Reader", "web-content-reader"],
  iconKey: "web-read",
  iconTone: "sky",
  type: "Workflow",
  packageMode: "Bundle",
  status: "正式版",
  statusTone: "stable",
  version: "v0.2.0",
  releasedAt: "2026-07-14T12:02:00+08:00",
  updated: "2026-07-19",
  author: "周全",
  license: "MIT",
  category: "信息获取 · 网页阅读",
  summary: "批量读取公众号文章和普通网页，自动选择提取路径并生成逐条验收清单。",
  detailSummary: "把混合网页读取、失败回退和结果验收组织成一条可检查的批量流程。",
  environments: ["Codex"],
  environmentNote: "Codex · Windows PowerShell",
  download: {
    path: "/downloads/web-content-reader-v0.2.0.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/web-content-reader-v0.2.0.zip",
    label: "下载 Workflow ZIP",
    fileType: "ZIP",
    sha256: "d68ff0e192fbb0e533e30fda1469dcf62c895e934425e33c5dadc3b3fc5e11e6",
  },
  overview: {
    title: "把混合网页读取变成可检查的流程",
    description:
      "Workflow先识别微信公众号和普通网页，再选择专用适配、直接提取或浏览器回退。每条结果都记录状态、提取方式、警告和正文路径。",
    scenarios: [
      "批量保存微信公众号与普通网页",
      "混合处理公众号、技术文档和监管网页",
      "为研究、写作或知识库准备Markdown资料",
      "保留失败路径，快速定位需要人工处理的页面",
    ],
  },
  testNote: "Codex按默认参数实际触发4条混合链接：3条正文成功，1条不可达地址如实失败并完成收尾；硬超时回归已通过。",
  formatTests: [
    { format: "微信公众号完整分享链接", status: "verified", label: "7篇样本7/7" },
    { format: "普通公开网页混合批次", status: "verified", label: "3篇样本3/3" },
    { format: "浏览器回退与正文清洗", status: "verified", label: "含硬超时回归" },
    { format: "访问验证页面", status: "pending", label: "必要时重试" },
    { format: "macOS / Linux", status: "pending", label: "尚未验证" },
  ],
  usageSteps: [
    "解压 ZIP，阅读 README、隐私说明、测试记录和已知限制。",
    "把 skill 目录下的两个 Skill 复制到当前 Agent 的 skills 目录。",
    "根据需要配置 OpenCLI、Trafilatura 或 BrowserAct；基础路径不会写入密钥或浏览器资料。",
    "提供公开 URL 运行批量脚本，结束后逐条检查 manifest.json。",
  ],
  install: {
    intro: "正式包包含两个 Skill、组件清单和多级提取路径。可以复制安装指令，也可以直接下载 ZIP。",
    steps: [
      "下载并解压 v0.2.0 Workflow ZIP，阅读 README.md、PRIVACY.md、KNOWN_LIMITATIONS.md 和 COMPONENTS.json。",
      "将 skill/web-content-reader 与 skill/weixin-article-reader 复制到当前 Agent 的 skills 目录。",
      "确认 Windows PowerShell 可用，再根据实际需要配置 OpenCLI、Trafilatura 或 BrowserAct。",
      "不要把 API Key、Cookie 或浏览器 Profile 写入 Skill 或公开文件。",
      "使用无敏感信息的公开 URL 做最小测试，并检查 manifest.json 中的逐条状态。",
    ],
    fallback: "缺少可选依赖时，Workflow会跳过对应路径并在结果清单中说明原因。",
  },
  components: [
    {
      slug: "weixin-article-reader",
      name: "微信公众号文章读取",
      type: "Skill",
      version: "v0.1.0",
      summary: "微信公众号文章专用读取能力，可单独安装。",
    },
    {
      name: "普通网页读取",
      type: "Internal",
      summary: "普通网页直接提取与正文清洗模块。",
    },
    {
      name: "路由、回退与质量检查",
      type: "Internal",
      summary: "链接路由、失败回退和逐条验收模块。",
    },
  ],
  dependencies: [
    { name: "Windows PowerShell", role: "当前执行环境" },
    { name: "OpenCLI", role: "公众号主路径" },
    { name: "Trafilatura", role: "普通网页直接提取" },
    { name: "BrowserAct", role: "可选浏览器回退" },
  ],
  privacy:
    "BrowserAct远程路径会把公开URL交给第三方服务。不要提交私有链接、敏感查询参数、Cookie或浏览器Profile。",
  limitations:
    "访问验证页面可能需要重试；隐身提取单次硬超时45秒、默认最多3次；微信公众号短链接应保留完整分享参数；浏览器整页结果仍需检查正文边界。当前主要验证Windows PowerShell环境。",
};
