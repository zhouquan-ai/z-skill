import type { ToolRecord } from "../tool-data";

export const legalPracticeArticle: ToolRecord = {
  slug: "legal-practice-article",
  name: "法律实务文章写作",
  aliases: ["法律实务文章", "legal-practice-article"],
  iconKey: "article-read",
  iconTone: "violet",
  type: "Skill",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.3",
  releasedAt: "2026-07-30T15:05:22+08:00",
  updated: "2026-07-30",
  author: "周全",
  license: "MIT",
  category: "法律工作 · 实务写作",
  summary: "把法律材料、现行规范和裁判依据组织成可核验、可执行的实务文章。",
  detailSummary: "按文章类型选择结构，处理来源、案例、职责和公开边界，并在定稿前保留必要的人工核验节点。",
  environments: ["Codex"],
  environmentNote: "Codex · Markdown",
  download: {
    path: "/downloads/legal-practice-article-v0.1.0-candidate.3.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/legal-practice-article-v0.1.0-candidate.3.zip",
    label: "下载候选版 ZIP",
    fileType: "ZIP",
    sha256: "e0a86ddcfe0e1efc5b5cb272f679586e771ca1b557664a1b6825921a90b148d2",
  },
  overview: {
    title: "让法律实务文章保留来源、边界和操作价值",
    description:
      "Skill先判断文章类型和核心问题，再组织材料、法律依据、裁判案例和操作方法。它保存写作流程和检查标准，但不替代对现行法律、裁判原文、内部资料公开权限和最终观点的核验。",
    scenarios: [
      "把合同、制度或业务流程整理为法律实务文章",
      "根据裁判文书撰写案例评析或裁判评论",
      "将多份来源材料拆分为边界清晰的系列文章",
      "检查文章中的法律时效、案例证明范围和职责主体",
    ],
  },
  testNote: "已完成流程型文章、单一裁判评论结构和仿真内部材料公开化三类最小回放。",
  formatTests: [
    { format: "流程型法律实务文章", status: "verified", label: "公开文章结构回放通过" },
    { format: "单一裁判评论", status: "verified", label: "结构与核验触发通过" },
    { format: "仿真内部资料公开化", status: "verified", label: "已知敏感字段隔离通过" },
    { format: "其他宿主Agent", status: "pending", label: "尚未验证" },
    { format: "多法域法律写作", status: "pending", label: "需另行核验" },
  ],
  usageSteps: [
    "解压候选包，阅读README、隐私说明、测试记录和已知限制。",
    "将skill/legal-practice-article复制到当前Agent的skills目录。",
    "提供文章用途、目标读者、主要材料和公开边界；内部材料先脱敏。",
    "涉及法律和裁判时回查当前权威来源，完成后再由作者审阅定稿。",
  ],
  install: {
    intro: "候选包提供法律实务文章的结构、来源、案例和公开边界规则，可以复制安装指令或直接下载ZIP。",
    steps: [
      "下载并解压v0.1.0-candidate.3 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
      "将skill/legal-practice-article复制到当前Agent的skills目录。",
      "重新加载Agent，用一份已经公开或完全脱敏的法律材料做最小测试。",
      "涉及现行法律、司法文件或裁判时，必须回查权威来源，不能依赖模型记忆。",
      "形成初稿后由作者复核事实、观点、公开边界和可执行建议。",
    ],
    fallback: "如果当前Agent不支持Skill安装，可直接参考SKILL.md和references中的流程执行。",
  },
  components: [],
  dependencies: [
    { name: "宿主Agent", role: "读取材料、编辑Markdown并执行流程" },
    { name: "权威法律来源", role: "核验现行规范、司法文件和裁判原文" },
  ],
  privacy:
    "Skill本身不保存或发送材料；实际读取和检索由宿主Agent完成。公开写作前仍须排除客户、案件、公司和其他不可公开信息。",
  limitations:
    "不能自动保证法律结论、法条、案例或时效正确，也不能替代律师、法务和作者判断；其他宿主Agent及多法域任务尚未验证。",
};
