export type ToolType = "Skill" | "Workflow" | "Agent" | "Tool";
export type PackageMode = "Standalone" | "Bundle";
export type ReleaseStatus = "正式版" | "公开候选";
export type StatusTone = "stable" | "candidate";
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
  type: ToolType;
  packageMode: PackageMode;
  status: ReleaseStatus;
  statusTone: StatusTone;
  version: string;
  releasedAt: string;
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
    type: "Skill",
    packageMode: "Standalone",
    status: "正式版",
    statusTone: "stable",
    version: "v0.1.0",
    releasedAt: "2026-07-13T21:19:00+08:00",
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
        "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/any-to-md-v0.1.0.zip",
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
      intro: "Codex 已完成实际触发。可以复制安装指令，也可以直接下载 ZIP。",
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
    type: "Workflow",
    packageMode: "Bundle",
    status: "正式版",
    statusTone: "stable",
    version: "v0.2.0",
    releasedAt: "2026-07-14T12:02:00+08:00",
    updated: "2026-07-14",
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
        name: "Weixin Article Reader",
        type: "Skill",
        version: "v0.1.0",
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
      "访问验证页面可能需要重试；隐身提取单次硬超时45秒、默认最多3次；微信公众号短链接应保留完整分享参数；浏览器整页结果仍需检查正文边界。当前主要验证Windows PowerShell环境。",
  },
  {
    slug: "weixin-article-reader",
    name: "Weixin Article Reader",
    glyph: "WX",
    type: "Skill",
    packageMode: "Standalone",
    status: "正式版",
    statusTone: "stable",
    version: "v0.1.0",
    releasedAt: "2026-07-14T12:02:00+08:00",
    updated: "2026-07-14",
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
      intro: "这是可独立安装的公众号文章读取Skill，也包含在Web Content Reader Workflow中。",
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
  },
  {
    slug: "authenticated-browser-workbench",
    name: "Authenticated Browser Workbench",
    glyph: "AUTH",
    type: "Skill",
    packageMode: "Standalone",
    status: "公开候选",
    statusTone: "candidate",
    version: "v0.1.0-candidate.1",
    releasedAt: "2026-07-19T18:30:00+08:00",
    updated: "2026-07-19",
    author: "周全",
    license: "MIT",
    category: "信息获取 · 登录态浏览",
    summary: "把通用BrowserSkill改造成带浏览器路由、账号边界、站点矩阵和验收规则的个人工作台。",
    detailSummary: "用可填写模板把登录态浏览的个人差异、隐私边界和失败经验沉淀为可维护的Skill。",
    environments: ["Codex"],
    environmentNote: "Codex · Windows · Chrome / Chromium",
    download: {
      path: "/downloads/authenticated-browser-workbench-v0.1.0-candidate.1.zip",
      sourceUrl:
        "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/authenticated-browser-workbench-v0.1.0-candidate.1.zip",
      label: "下载候选版 ZIP",
      fileType: "ZIP",
      sha256: "caa9930c4bcb5381bf2fe5fb6753d483165f3a2da116b1b0c5cd7e923007b6cb",
    },
    overview: {
      title: "让通用浏览器能力适应真实个人环境",
      description:
        "BrowserSkill解决浏览器连接和页面操作，本Skill在外层补充任务分流、浏览器与账号选择、站点验证矩阵、停止条件和结果验收。个人版与公开模板分离，不把登录信息或私有站点记录打包发布。",
      scenarios: [
        "复用已登录浏览器进行站内搜索和后台只读检查",
        "在多个浏览器和账号之间建立明确的使用边界",
        "把站点差异、失败经验和替代路径写成长期规则",
        "从个人Skill提炼脱敏、可公开复用的配置模板",
      ],
    },
    testNote: "Chrome 150与豆包浏览器Chromium 135均完成180秒连接监测、登录态只读检索、完整重启和会话清理；验证的是工作台方法，不代表所有登录网站兼容。",
    formatTests: [
      { format: "Chrome 150登录态只读检索", status: "verified", label: "当前Windows环境通过" },
      { format: "豆包浏览器Chromium 135", status: "verified", label: "当前Windows环境通过" },
      { format: "浏览器完整重启", status: "verified", label: "两款浏览器均通过" },
      { format: "多实例显式选择与会话清理", status: "verified", label: "当前样本通过" },
      { format: "休眠唤醒与长任务", status: "pending", label: "候选期继续观察" },
      { format: "macOS / Linux", status: "pending", label: "尚未验证" },
    ],
    usageSteps: [
      "先按BrowserSkill官方说明安装bsk CLI、浏览器扩展和上游browser-skill。",
      "解压候选包，把skill/authenticated-browser-workbench复制到当前Agent的skills目录。",
      "填写browser-profile.md和site-matrix.md，只记录路由与边界，不写凭据和私密页面内容。",
      "使用一个无副作用的登录态搜索任务验证实例选择、可见结果和会话停止。",
    ],
    install: {
      intro: "候选包只提供个人化编排层，不捆绑BrowserSkill本体。可以复制安装指令，也可以直接下载ZIP。",
      steps: [
        "下载并解压v0.1.0-candidate.1 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
        "按https://github.com/Tencent/BrowserSkill的当前说明安装bsk CLI、扩展和上游browser-skill。",
        "将skill/authenticated-browser-workbench复制到当前Agent的skills目录。",
        "填写浏览器用途、账号硬边界和站点矩阵；不要写入密码、Cookie、Token、本机Profile路径或实例ID。",
        "重新加载Agent，用只读任务验证登录态复用，并确认结束后活动会话为零。",
      ],
      fallback: "如果当前环境不能安装BrowserSkill，本模板只能作为个性化设计参考，不能单独控制浏览器。",
    },
    components: [],
    dependencies: [
      { name: "BrowserSkill", role: "上游浏览器执行能力" },
      { name: "bsk CLI", role: "本地会话与浏览器控制" },
      { name: "Chromium浏览器", role: "承载使用者已有登录态" },
      { name: "Windows PowerShell", role: "候选包连接诊断脚本" },
    ],
    privacy:
      "不保存Cookie、Token、密码、验证码、账号标识、浏览器Profile、聊天历史或后台数据；实际页面访问由本地BrowserSkill、浏览器和目标网站完成。",
    limitations:
      "必须另行安装BrowserSkill；其他Chromium浏览器需逐机验证；休眠唤醒、长任务、macOS和Linux尚未测试。候选包不分发或自动修改第三方扩展，也不承诺所有登录网站可用。",
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

export function compareToolsByUpdated(left: ToolRecord, right: ToolRecord) {
  return right.updated.localeCompare(left.updated)
    || right.releasedAt.localeCompare(left.releasedAt)
    || left.name.localeCompare(right.name, "en");
}

export function getRecentTools(limit = 3) {
  return tools.toSorted((left, right) =>
    right.releasedAt.localeCompare(left.releasedAt)
      || left.name.localeCompare(right.name, "en"))
    .slice(0, limit);
}

export function getReleaseDate(tool: ToolRecord) {
  return tool.releasedAt.slice(0, 10);
}

export function buildInstallPrompt(tool: ToolRecord) {
  const steps = tool.install.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  const addressLabel = tool.status === "正式版" ? "权威版本地址" : "权威候选包地址";

  return `请安装 ${tool.name} ${tool.version}。

${addressLabel}：
${tool.download.sourceUrl}

${steps}

${tool.install.fallback}`;
}

export const catalogUpdated = tools
  .map((tool) => tool.updated)
  .toSorted()
  .at(-1) ?? "";

export const toolTypes = ["全部", "Skill", "Workflow", "Agent", "Tool"] as const;
export const toolEnvironments = ["全部环境", "Codex"] as const;
export const toolStatuses = ["全部状态", "正式版", "公开候选"] as const;
