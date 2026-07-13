export type ToolType = "Skill" | "Workflow" | "Agent" | "工具";
export type ReleaseStatus = "已验证" | "公开候选" | "尚未验证";
export type StatusTone = "verified" | "candidate" | "unverified";
export type FormatTestStatus = "verified" | "failed" | "pending";

export type ToolRecord = {
  slug: string;
  name: string;
  glyph: string;
  featured: boolean;
  type: ToolType;
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
    status: "公开候选",
    statusTone: "candidate",
    version: "v0.1.0-candidate",
    updated: "2026-07-13",
    author: "周全",
    license: "MIT",
    category: "知识管理 · 文件处理",
    summary:
      "把 PDF、Word、Excel、图片等文件转换为可维护、可复核的 Markdown 基础资料。",
    detailSummary: "把常见文件转换为可维护、可复核的 Markdown 基础资料。",
    environments: [],
    environmentNote:
      "Codex 与 Claude 个人 Skills 目录安装及本地脚本已验证；Agent 实际触发因宿主 CLI 问题待复验",
    download: {
      path: "/downloads/any-to-md-v0.1.0-candidate.zip",
      sourceUrl:
        "https://raw.githubusercontent.com/zzzq8848-ai/z-skill/main/public/downloads/any-to-md-v0.1.0-candidate.zip",
      label: "下载候选版 ZIP",
      fileType: "ZIP",
      sha256: "99ef153a6a2558e199ddb006bbee9ce178b32a9c748bf0ee2a33514ba5355edb",
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
    testNote: "状态仅对应本仓库测试，不代表所有复杂文件都能无误转换。",
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
      "把 skill/any-to-md 复制到目标 Agent 认可的 skills 目录。",
      "远程转换前确认文件可以上传第三方服务；敏感资料不要直接上传。",
      "转换后运行本地修复和质量扫描，并逐项对照原文件。",
    ],
    install: {
      intro:
        "安装目录与本地脚本已经验证；仍要求 Agent 先检查环境和说明文件，实际触发结果须据实报告。",
      steps: [
        "先检查当前环境支持的 skills 目录与安装规则，不要猜测路径。",
        "从上述地址下载并解压候选版 ZIP，阅读 README、PRIVACY.md 和 KNOWN_LIMITATIONS.md。",
        "将 skill/any-to-md 放入当前环境认可的 skills 目录。",
        "不要上传任何敏感文件进行测试；默认远程转换可能把文件发送至 MinerU。",
        "安装后只做无敏感信息的最小触发检查，并报告下载来源、实际安装路径、测试结果与失败原因。",
      ],
      fallback: "如果当前环境不支持该 Skill，请停止，不要伪造成功结果。",
    },
    privacy:
      "默认转换可能把原文件上传至 MinerU。处理客户、案件或其他敏感资料前，须先脱敏并确认上传权限。",
    limitations:
      "精准接口因私人 Token 返回 401，尚未复验；Codex CLI 受版本与模型兼容问题阻断，Claude Code 模型连接超时，Agent 实际触发仍待复验。复杂表格、OCR 和语义结构必须回看原件。",
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

export function buildInstallPrompt(tool: ToolRecord) {
  const steps = tool.install.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return `请安装 ${tool.name} ${tool.version}。

权威候选包地址：
${tool.download.sourceUrl}

${steps}

${tool.install.fallback}`;
}

export const featuredTool = tools.find((tool) => tool.featured) ?? tools[0];
export const catalogUpdated = tools
  .map((tool) => tool.updated)
  .toSorted()
  .at(-1) ?? "";

export const toolTypes = ["全部", "Skill", "Workflow", "Agent", "工具"] as const;
export const toolEnvironments = ["全部环境", "Codex", "Claude", "通用"] as const;
export const toolStatuses = ["全部状态", "已验证", "公开候选", "尚未验证"] as const;
