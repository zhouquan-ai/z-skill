import type { ToolRecord } from "../tool-data";

export const callableKnowledge: ToolRecord = {
  slug: "callable-knowledge",
  name: "知识卡产出与调用",
  aliases: ["知识卡片", "知识卡调用", "callable-knowledge"],
  iconKey: "file-convert",
  iconTone: "teal",
  type: "Workflow",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.4",
  releasedAt: "2026-07-30T15:05:22+08:00",
  updated: "2026-07-30",
  author: "周全",
  license: "MIT",
  category: "知识管理 · 资料复用",
  summary: "把文章、网页和笔记整理成可追溯知识卡，并在后续问题中按需调用。",
  detailSummary: "将明确授权的资料保存为知识卡和调用索引；新问题出现时只选择少量相关卡片，并复核来源、日期、冲突和当前有效性。",
  environments: ["Codex"],
  environmentNote: "Codex · Markdown",
  download: {
    path: "/downloads/callable-knowledge-v0.1.0-candidate.4.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/callable-knowledge-v0.1.0-candidate.4.zip",
    label: "下载候选版 ZIP",
    fileType: "ZIP",
    sha256: "994af8bd5927738649f7a7d58130c39fa911385b7b4119575bc1894be24cf2c4",
  },
  overview: {
    title: "让保存的资料在以后真正参与判断",
    description:
      "Workflow把资料保存和知识调用分开：只有明确授权时才建立卡片和索引；调用时先选择少量相关卡片，再检查日期、适用边界、冲突和当前事实。它不包含向量数据库或自动语义召回。",
    scenarios: [
      "把文章、网页和笔记整理为可追溯知识卡",
      "为既有知识卡建立轻量调用索引",
      "从少量旧资料中提取与当前问题有关的内容",
      "发现资料冲突、过期或被新事实替代时及时降级",
    ],
  },
  testNote: "已完成只读不保存、明确入库、单卡调用、两卡冲突和两种Markdown目录布局的最小回放。",
  formatTests: [
    { format: "Markdown知识卡与调用索引", status: "verified", label: "模板链路通过" },
    { format: "只读理解不自动保存", status: "verified", label: "最小回放通过" },
    { format: "旧资料冲突与当前复核", status: "verified", label: "两卡回放通过" },
    { format: "两种Markdown目录布局", status: "verified", label: "相对路径通过" },
    { format: "其他知识工具与宿主Agent", status: "pending", label: "尚未验证" },
  ],
  usageSteps: [
    "解压候选包，阅读README、隐私说明、测试记录和已知限制。",
    "将skill/callable-knowledge复制到当前Agent的skills目录。",
    "根据自己的资料结构复制知识卡和调用索引模板，不写入秘密或未授权全文。",
    "只有明确要求保存时才建立卡片；调用旧资料时重新检查日期、冲突和当前事实。",
  ],
  install: {
    intro: "候选包提供知识卡模板、调用索引和保存—调用规则，可以复制安装指令或直接下载ZIP。",
    steps: [
      "下载并解压v0.1.0-candidate.4 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
      "将skill/callable-knowledge复制到当前Agent的skills目录。",
      "按自己的目录结构复制assets中的知识卡和调用索引模板。",
      "用无敏感信息的资料分别回放一次只读总结和一次明确入库。",
      "调用旧卡片时检查来源、日期、核验状态和冲突，不把历史口径直接写成当前事实。",
    ],
    fallback: "如果当前Agent不支持Skill安装，可直接复制模板并参照SKILL.md手工执行保存和调用流程。",
  },
  components: [],
  dependencies: [
    { name: "宿主Agent", role: "读写Markdown、搜索索引并按需核验来源" },
    { name: "本地文件系统", role: "保存知识卡、调用索引和原始资料定位信息" },
  ],
  privacy:
    "Workflow本身不联网；不要把密码、Cookie、Token、私人消息、客户资料或无权长期保存的全文写入卡片和索引。",
  limitations:
    "不包含向量数据库、嵌入模型或自动语义召回；检索质量依赖卡片、索引和宿主Agent，旧资料及快速变化事实仍需重新核验。",
};
