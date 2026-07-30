import type { ToolRecord } from "../tool-data";

export const anyToMd: ToolRecord = {
  slug: "any-to-md",
  name: "多格式转 Markdown",
  aliases: ["Any-to-MD", "Any to Markdown"],
  iconKey: "file-convert",
  iconTone: "indigo",
  type: "Skill",
  packageMode: "Standalone",
  status: "正式版",
  statusTone: "stable",
  version: "v0.1.0",
  releasedAt: "2026-07-13T21:19:00+08:00",
  updated: "2026-07-19",
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
      "多格式转 Markdown 把格式识别、内容转换、结构修复和质量扫描组织成一条可复核流程。生成的 Markdown 是衍生资料，不能替代原文件、签章、公式、批注或修订记录。",
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
};
