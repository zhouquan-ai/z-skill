export type ToolType = "Skill" | "Workflow" | "Agent" | "Tool";
export type PackageMode = "Standalone" | "Bundle";
export type ReleaseStatus = "已验证" | "公开候选" | "尚未验证";
export type StatusTone = "verified" | "candidate" | "unverified";
export type FormatTestStatus = "verified" | "failed" | "pending";

export type ToolComponent = {
  slug?: string;
  name: string;
  type: "Skill" | "Internal";
  version?: string;
  summary: string;
};

export type ToolDependency = {
  name: string;
  role: string;
};

export type ToolRecord = {
  slug: string;
  name: string;
  glyph: string;
  featured: boolean;
  type: ToolType;
  packageMode: PackageMode;
  status: ReleaseStatus;
  statusTone: StatusTone;
  version: string;
  updated: string;
  author: string;
  license: string;
  category: string;
  summary: string;
  detailSummary: string;
  environments: string[];
  environmentNote: string;
  download: {
    path: string;
    sourceUrl: string;
    label: string;
    fileType: "ZIP";
    sha256: string;
  };
  overview: {
    title: string;
    description: string;
    scenarios: string[];
  };
  testNote: string;
  formatTests: Array<{
    format: string;
    status: FormatTestStatus;
    label: string;
  }>;
  usageSteps: string[];
  install: {
    intro: string;
    steps: string[];
    fallback: string;
  };
  components: ToolComponent[];
  dependencies: ToolDependency[];
  privacy: string;
  limitations: string;
};

export const tools: ToolRecord[] = [
  {
    slug: "any-to-md",
    name: "Any-to-MD",
    glyph: "MD",
    featured: true,
    type: "Skill",
    packageMode: "Standalone",
    status: "已验证",
    statusTone: "verified",
    version: "v0.1.0",
    updated: "2026-07-13",
    author: "周全",
    license: "MIT",
    category: "知识管理 · 文件处理",
    summary:
      "把 PDF、Word、Excel、图片等文件转换为可维护、可复核的 Markdown 基础资料。",
    detailSummary: "把常见文件转换为可维护、可复核的 Markdown 基础资料。",
    environments: ["Codex"],
    environmentNote: "Codex",
    download: {
      path: "/downloads/any-to-md-v0.1.0.zip",
      sourceUrl:
        "https://raw.githubusercontent.com/zzzq8848-ai/z-skill/main/public/downloads/any-to-md-v0.1.0.zip",
      label: "下载 ZIP",
      fileType: "ZIP",
      sha256: "0ecc35a9957d7756ee36e27d503018036f1b118960e0832f5d25b32275160f80",
    },
    overview: {
      title: "让基础资料脱离单一 AI 平台",
      description:
        "Any-to-MD 把格式识别、内容转换、结构修复和质量扫描组织成一条可复核流程。生成的 Markdown 是衍生资料，不能替代原文件、签章、公式、批注或修订记录。",
      scenarios: [
        "把研究报告与合同附件整理为可检索的 Markdown",
        "为知识库准备可跨平台迁移的基础资料",
        "将表格和图片转换后继续人工复核与修订",
        "为 Agent 提供结构更稳定的长期输入",
      ],
    },
    testNote: "PDF、XLSX、PNG 与 Markdown 修复已完成仓库样例验证。",
    formatTests: [
      { format: "PDF", status: "verified", label: "本仓库已验证" },
      { format: "XLSX", status: "verified", label: "本仓库已验证" },
      { format: "PNG", status: "verified", label: "本仓库已验证" },
      { format: "Markdown", status: "verified", label: "本仓库已验证" },
      { format: "DOCX", status: "failed", label: "轻量接口本轮失败" },
      { format: "PPT / PPTX", status: "pending", label: "尚未验证" },
    ],
    usageSteps: [
      "解压 ZIP，并先阅读 README、隐私说明和已知限制。",
      "把 skill/any-to-md 复制到目标 Agent 的 skills 目录。",
      "远程转换前确认文件可以上传第三方服务；敏感资料不要直接上传。",
      "转换后运行本地修复和质量扫描，并逐项对照原文件。",
    ],
    install: {
      intro: "Codex 已完成实际触发。可以复制 Prompt 安装，也可以直接下载 ZIP。",
      steps: [
        "从上述地址下载并解压 v0.1.0 ZIP，阅读 README、PRIVACY.md 和 KNOWN_LIMITATIONS.md。",
        "将 skill/any-to-md 放入当前 Agent 的 skills 目录。",
        "重新加载 Agent，再用无敏感信息的文件运行一次。",
        "远程转换可能把文件发送至 MinerU，不要直接上传敏感材料。",
      ],
      fallback: "如果当前 Agent 不提供 Skills 目录，可直接使用 ZIP 中的本地脚本。",
    },
    components: [],
    dependencies: [
      { name: "MinerU", role: "远程文件转换" },
      { name: "Python", role: "本地修复与质量扫描" },
    ],
    privacy:
      "默认转换可能把原文件上传至 MinerU。处理客户、案件或其他敏感资料前，须先脱敏并确认上传权限。",
    limitations:
      "精准接口尚未复验；DOCX 轻量接口本轮失败，PPT / PPTX 尚未验证。复杂表格、OCR 和语义结构仍需回看原件。",
  },
  {
    slug: "web-content-reader",
    name: "Web Content Reader",
    glyph: "WEB",
    featured: false,
    type: "Workflow",
    packageMode: "Bundle",
    status: "公开候选",
    statusTone: "candidate",
    version: "v0.2.0-candidate.1",
    updated: "2026-07-13",
    author: "周全",
    license: "MIT",
    category: "信息获取 · 网页阅读",
    summary: "批量读取公众号文章和普通网页，自动选择提取路径并生成逐条验收清单。",
    detailSummary: "把混合网页读取、失败回退和结果验收组织成一条可检查的批量流程。",
    environments: ["Codex"],
    environmentNote: "Codex · Windows PowerShell",
    download: {
      path: "/downloads/web-content-reader-v0.2.0-candidate.1.zip",
      sourceUrl:
        "https://raw.githubusercontent.com/zzzq8848-ai/z-skill/main/public/downloads/web-content-reader-v0.2.0-candidate.1.zip",
      label: "下载候选版 Workflow ZIP",
      fileType: "ZIP",
      sha256: "7c946f4b691cb0c24706c5b9510875d80a6ad1a904f63df88da67d513dbfe45a",
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
    testNote: "公众号完整分享链接7/7，普通网页混合批次3/3；候选包构建、解压和失败诊断已验证。",
    formatTests: [
      { format: "微信公众号完整分享链接", status: "verified", label: "7篇样本7/7" },
      { format: "普通公开网页混合批次", status: "verified", label: "3篇样本3/3" },
      { format: "浏览器回退与正文清洗", status: "verified", label: "当前样本已验证" },
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
      intro: "候选包包含两个 Skill、组件清单和多级提取路径。可以复制 Prompt 安装，也可以直接下载 ZIP。",
      steps: [
        "下载并解压候选版 Workflow ZIP，阅读 README.md、PRIVACY.md、KNOWN_LIMITATIONS.md 和 COMPONENTS.json。",
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
        name: "Weixin Article Reader",
        type: "Skill",
        version: "v0.1.0-candidate.1",
        summary: "微信公众号文章专用读取能力，可单独安装。",
      },
      {
        name: "Generic Web Reader",
        type: "Internal",
        summary: "普通网页直接提取与正文清洗模块。",
      },
      {
        name: "Routing / Fallback / Quality Check",
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
      "访问验证页面可能需要重试；微信公众号短链接应保留完整分享参数；浏览器整页结果仍需检查正文边界。当前主要验证Windows PowerShell环境。",
  },
  {
    slug: "weixin-article-reader",
    name: "Weixin Article Reader",
    glyph: "WX",
    featured: false,
    type: "Skill",
    packageMode: "Standalone",
    status: "公开候选",
    statusTone: "candidate",
    version: "v0.1.0-candidate.1",
    updated: "2026-07-13",
    author: "周全",
    license: "MIT",
    category: "信息获取 · 微信公众号",
    summary: "批量读取微信公众号文章，保留正文、元数据和逐篇状态。",
    detailSummary: "面向微信公众号完整分享链接的独立读取Skill，支持批量处理与失败回退。",
    environments: ["Codex"],
    environmentNote: "Codex · Windows PowerShell",
    download: {
      path: "/downloads/weixin-article-reader-v0.1.0-candidate.1.zip",
      sourceUrl:
        "https://raw.githubusercontent.com/zzzq8848-ai/z-skill/main/public/downloads/weixin-article-reader-v0.1.0-candidate.1.zip",
      label: "下载候选版 Skill ZIP",
      fileType: "ZIP",
      sha256: "d1c559897c30630d8ff8bba2abb927ceb4cd7fd2e6ea72fb88b683e18f4edb2e",
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
    testNote: "微信公众号完整分享链接7篇样本7/7，BrowserAct单篇回退与批量清单已验证。",
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
      intro: "这是可独立安装的公众号文章读取Skill，也包含在Web Content Reader Workflow中。",
      steps: [
        "下载并解压候选版 Skill ZIP，阅读 README.md、PRIVACY.md、KNOWN_LIMITATIONS.md 和 COMPONENTS.json。",
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
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getVerifiedFormats(tool: ToolRecord) {
  return tool.formatTests
    .filter((test) => test.status === "verified")
    .map((test) => test.format);
}

export function getIncludedIn(slug: string) {
  return tools.filter((tool) => tool.components.some((component) => component.slug === slug));
}

export function getPackageModeLabel(mode: PackageMode) {
  return mode === "Bundle" ? "组合包" : "独立包";
}

export function buildInstallPrompt(tool: ToolRecord) {
  const steps = tool.install.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  const addressLabel = tool.status === "已验证" ? "权威版本地址" : "权威候选包地址";

  return `请安装 ${tool.name} ${tool.version}。

${addressLabel}：
${tool.download.sourceUrl}

${steps}

${tool.install.fallback}`;
}

export const featuredTool = tools.find((tool) => tool.featured) ?? tools[0];
export const catalogUpdated = tools
  .map((tool) => tool.updated)
  .toSorted()
  .at(-1) ?? "";

export const toolTypes = ["全部", "Skill", "Workflow", "Agent", "Tool"] as const;
export const toolEnvironments = ["全部环境", "Codex"] as const;
export const toolStatuses = ["全部状态", "已验证", "公开候选", "尚未验证"] as const;
