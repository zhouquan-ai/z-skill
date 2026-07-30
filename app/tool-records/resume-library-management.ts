import type { ToolRecord } from "../tool-data";

export const resumeLibraryManagement: ToolRecord = {
  slug: "resume-library-management",
  name: "简历库与简历管理",
  aliases: ["简历事实库", "职业事实系统", "多目标简历", "resume-library-management"],
  iconKey: "file-convert",
  iconTone: "indigo",
  type: "Workflow",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.1",
  releasedAt: "2026-07-30T17:55:17+08:00",
  updated: "2026-07-30",
  author: "周全",
  license: "MIT",
  category: "职业管理 · 简历事实",
  summary: "先维护来源、事实和贡献边界，再按岗位画像生成可追溯的多目标简历草稿。",
  detailSummary:
    "把来源、职业事实、经历模块、岗位画像和输出分层管理，区分证据等级、核验状态与人工审阅状态，并将案件事实、本人动作和团队贡献分别记录。",
  environments: ["Codex"],
  environmentNote: "Codex · JSON · Markdown · Python 3.10+（可选校验）",
  download: {
    path: "/downloads/resume-library-management-v0.1.0-candidate.1.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/resume-library-management-v0.1.0-candidate.1.zip",
    label: "下载候选版 ZIP",
    fileType: "ZIP",
    sha256: "616a377b55c54d54160f27f3bf25ad779e6942e69fea97381edd9c3b1d6bbd0c",
  },
  overview: {
    title: "把简历改造成可追溯的职业事实系统",
    description:
      "Workflow先登记来源和职业事实，再建立经历与案件模块；制作目标简历时只选择、排序和压缩已存在的事实，不在输出层创造经历。",
    scenarios: [
      "持续维护教育、任职、项目、案件和资格事实",
      "区分证据等级、核验状态、冲突与人工审阅状态",
      "把案件客观事实、本人动作和团队成果分开",
      "根据企业法务或争议解决等岗位画像生成不同草稿",
    ],
  },
  testNote:
    "已用一套完整仿真履历回放6个来源、7项事实、2个仿真案件、5个模块、2个岗位画像和2份目标输出；未使用真实个人或案件材料。",
  formatTests: [
    { format: "来源登记与事实引用", status: "verified", label: "引用校验通过" },
    { format: "案件事实与个人贡献分离", status: "verified", label: "边界校验通过" },
    { format: "企业法务目标简历", status: "verified", label: "仿真回放通过" },
    { format: "争议解决目标简历", status: "verified", label: "仿真回放通过" },
    { format: "真实招聘平台自动投递", status: "pending", label: "不在本包范围" },
  ],
  usageSteps: [
    "解压候选包，阅读README、隐私说明、测试记录和已知限制。",
    "将skill/resume-library-management复制到当前Agent的skills目录。",
    "复制library-template.json，先登记来源，再维护事实、案件和经历模块。",
    "建立目标岗位画像，选择模块并生成带引用、待人工审阅的独立简历版本。",
    "真实外发前逐项复核个人信息、证明材料、保密义务和贡献边界。",
  ],
  install: {
    intro: "候选包提供五层简历库规则、JSON模板、仿真履历、多目标输出和可选的本地校验脚本。",
    steps: [
      "下载并解压v0.1.0-candidate.1 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
      "将skill/resume-library-management复制到当前Agent的skills目录。",
      "先用examples/synthetic-library.json回放来源、事实、模块、岗位画像和两份输出。",
      "复制assets/library-template.json建立自己的库，并使用稳定编号维护引用。",
      "分享或投递前运行scripts/validate_library.py并完成output-review-checklist.md人工审阅。",
    ],
    fallback: "如果当前Agent不支持Workflow安装，可直接使用SKILL.md、JSON模板和人工审阅清单执行五层流程。",
  },
  components: [],
  dependencies: [
    { name: "宿主Agent", role: "维护来源、事实、模块、岗位画像和目标输出" },
    { name: "JSON与Markdown文件", role: "保存结构化引用和可审阅简历草稿" },
    { name: "Python 3.10+（可选）", role: "运行结构、引用、贡献边界和隐私形态校验" },
  ],
  privacy:
    "公开包全部使用仿真人物、单位和案件；真实使用时应限制原件访问，不得把联系方式、薪酬、客户、案件或证明材料直接复制到公开仓库。",
  limitations:
    "不核验真实证书、任职或案件，不保证招聘结果；不自动生成Word/PDF、不访问招聘网站，也不能替代保密、背景调查和最终人工审阅。",
};
