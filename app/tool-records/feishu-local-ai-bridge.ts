import type { ToolRecord } from "../tool-data";

export const feishuLocalAiBridge: ToolRecord = {
  slug: "feishu-local-ai-bridge",
  name: "飞书远程调用本地AI",
  aliases: ["飞书桥接本地AI", "飞书远程调用", "本地AI桥接", "feishu-local-ai-bridge"],
  iconKey: "secure-search",
  iconTone: "sky",
  type: "Workflow",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.1",
  releasedAt: "2026-07-30T18:15:37+08:00",
  updated: "2026-07-30",
  author: "周全",
  license: "MIT",
  category: "通讯协作 · 本地AI",
  summary: "用消息过滤、权限分级、去重、Git留痕和回包验收，把飞书安全接到限定工作区的本地AI。",
  detailSummary:
    "提供飞书入口、桥接层、本地AI、限定工作区和回包验收的可复现架构，并用完全离线的测试仓库演示消息过滤、去重、路径限制、Git状态与审计。",
  environments: ["Codex"],
  environmentNote: "飞书开放平台 · 本地AI适配器 · Git · Python 3.11+（离线冒烟）",
  download: {
    path: "/downloads/feishu-local-ai-bridge-v0.1.0-candidate.1.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/feishu-local-ai-bridge-v0.1.0-candidate.1.zip",
    label: "下载候选版 ZIP",
    fileType: "ZIP",
    sha256: "1d15b5eb21475e9cf63d739bda20a08241ec3392b7c3fb2a960c627ced5b23eb",
  },
  overview: {
    title: "把远程消息变成可限制、可去重、可回读的本地任务",
    description:
      "Workflow不提供远程控制电脑，而是把消息入口、身份、权限、工作区、Git差异和结果回包逐层收紧；默认只读，写入只允许显式工作区相对路径。",
    scenarios: [
      "从飞书私聊查询本地工作区任务状态",
      "把明确写请求限制在一个Git工作区和允许路径",
      "防止飞书事件重试导致重复执行",
      "用Git状态、文件哈希和回包完成端到端验收",
    ],
  },
  testNote:
    "已在完全隔离的仿真Git仓库回放允许私聊、重复事件、群聊、未知用户、只读拒绝、越界路径、限定写入和去敏审计；未连接真实飞书或本地AI。",
  formatTests: [
    { format: "允许私聊与Git状态回读", status: "verified", label: "离线冒烟通过" },
    { format: "事件去重与重复送达", status: "verified", label: "状态回放通过" },
    { format: "权限分级与工作区路径", status: "verified", label: "拒绝用例通过" },
    { format: "限定写入、哈希与Git差异", status: "verified", label: "测试仓库通过" },
    { format: "真实飞书与本地AI端到端", status: "pending", label: "需自行配置验证" },
  ],
  usageSteps: [
    "解压候选包，阅读README、隐私说明、测试记录和已知限制。",
    "将skill/feishu-local-ai-bridge复制到当前Agent的skills目录。",
    "阅读架构、权限矩阵、过滤规则和回读清单，先保持只读配置。",
    "在隔离Git仓库运行离线冒烟，确认重复、拒绝和限定写入行为。",
    "真实接入时使用自己的飞书应用、秘密管理和本地AI适配器，完成端到端回包后再扩大权限。",
  ],
  install: {
    intro: "候选包提供架构、配置模板、权限矩阵、过滤规则、回读清单和离线测试仓库，不包含第三方桥接或AI代码。",
    steps: [
      "下载并解压v0.1.0-candidate.1 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
      "将skill/feishu-local-ai-bridge复制到当前Agent的skills目录。",
      "复制assets/config.example.toml，保留环境变量占位符和read_only默认权限。",
      "在examples/smoke-repo初始化Git后运行scripts/smoke_bridge.py，回放过滤、去重和限定写入。",
      "真实部署前核对飞书权限、桥接实现、AI适配器版本、秘密存储、日志保留和关闭流程。",
    ],
    fallback: "如果当前Agent不支持Workflow安装，可直接使用架构、权限矩阵、过滤规则和端到端回读清单审计现有桥接方案。",
  },
  components: [],
  dependencies: [
    { name: "飞书开放平台入口", role: "提供经过鉴权的事件订阅或Channel消息" },
    { name: "桥接实现", role: "执行过滤、去重、权限路由和回包；本包不捆绑具体项目" },
    { name: "本地AI适配器", role: "在显式工作区内处理已授权任务" },
    { name: "Git", role: "记录写前基线、实际差异和范围精确的提交" },
    { name: "Python 3.11+（仅冒烟）", role: "运行离线过滤、去重、路径与审计示例" },
  ],
  privacy:
    "包内没有真实凭据、用户ID、聊天记录、绝对路径或私人工作区；真实系统应把凭据放入秘密管理，并对消息、日志、回包和保留期限实行最小化。",
  limitations:
    "不实现真实飞书鉴权或消息发送，不启动本地AI，不提供Shell、桌面或远程控制；网络、休眠、重试风暴和多实例一致性仍需生产环境验证。",
};
