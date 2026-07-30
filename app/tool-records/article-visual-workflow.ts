import type { ToolRecord } from "../tool-data";

export const articleVisualWorkflow: ToolRecord = {
  slug: "article-visual-workflow",
  name: "文章视觉规划与生图",
  aliases: ["视觉故事简报", "文章配图规划", "生图前视觉规划", "article-visual-workflow"],
  iconKey: "article-read",
  iconTone: "violet",
  type: "Skill",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.1",
  releasedAt: "2026-07-30T17:32:03+08:00",
  updated: "2026-07-30",
  author: "周全",
  license: "MIT",
  category: "内容生产 · 视觉规划",
  summary: "先判断文章该画什么，再生成、验收，并只重做出现问题的图片。",
  detailSummary:
    "从冻结文章形成视觉故事简报，在场景图、示意图和不配图之间路由，锁定插入位置、ASCII草图、生成提示和逐图验收条件；不内置图像模型。",
  environments: ["Codex"],
  environmentNote: "Codex · Markdown · Python 3.10+（可选校验）",
  download: {
    path: "/downloads/article-visual-workflow-v0.1.0-candidate.1.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/article-visual-workflow-v0.1.0-candidate.1.zip",
    label: "下载候选版 ZIP",
    fileType: "ZIP",
    sha256: "80f7c88c537af29a4a06409feb6d37a13db10ff93810ae837c28067b905d2d31",
  },
  overview: {
    title: "把随机生图改成可检查的视觉决策",
    description:
      "Skill先读取冻结正文并建立视觉故事简报，再为候选位置选择场景图、示意图或不配图。每个生成项都绑定正文锚点、唯一任务、提示、验收和局部重做条件。",
    scenarios: [
      "为长文章建立完整但不过量的配图计划",
      "判断一段内容应该使用场景图、示意图还是不配图",
      "用ASCII草图冻结精确关系，再交给确定性绘图工具",
      "只重做用户点名的失败图片，保留其他已接受结果",
    ],
  },
  testNote:
    "已用两篇完全仿真文章回放三种路由、正文锚点、ASCII草图、提示、验收和隐私路径拦截；未调用外部图像模型。",
  formatTests: [
    { format: "视觉故事简报与图片路由", status: "verified", label: "仿真回放通过" },
    { format: "场景图执行卡与局部重做", status: "verified", label: "字段校验通过" },
    { format: "示意图ASCII草图", status: "verified", label: "结构校验通过" },
    { format: "不配图停止条件", status: "verified", label: "仿真回放通过" },
    { format: "真实图像模型输出质量", status: "pending", label: "不由本包验证" },
  ],
  usageSteps: [
    "解压候选包，阅读README、隐私说明、测试记录和已知限制。",
    "将skill/article-visual-workflow复制到当前Agent的skills目录。",
    "提供已经冻结的Markdown文章，并先要求输出视觉故事简报和图片路由。",
    "确认正文插入位置、场景执行卡或ASCII草图后，再使用自选工具逐图生成。",
    "逐图人工验收；失败时只重做当前图，其他已接受图片保持不动。",
  ],
  install: {
    intro: "候选包提供生成前视觉规划规则、模板、仿真示例和可选的本地结构校验脚本。",
    steps: [
      "下载并解压v0.1.0-candidate.1 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
      "将skill/article-visual-workflow复制到当前Agent的skills目录。",
      "用examples中的两篇仿真文章回放视觉故事简报、三种路由和局部重做。",
      "如需结构检查，使用Python 3.10+运行scripts/validate_plan.py。",
      "接入真实文章或图像模型前，重新检查文章、人物、参考图和素材的公开权限。",
    ],
    fallback: "如果当前Agent不支持Skill安装，可直接参照SKILL.md和assets模板手工建立视觉简报与图片计划。",
  },
  components: [],
  dependencies: [
    { name: "宿主Agent", role: "读取冻结文章、建立视觉计划并组织逐图验收" },
    { name: "图像生成或绘图工具（可选）", role: "执行已经确认的场景图或示意图任务" },
    { name: "Python 3.10+（可选）", role: "运行本地计划结构与正文锚点校验" },
  ],
  privacy:
    "包内只有仿真材料且校验脚本不联网；真实文章、人物、客户资料、参考图和模型凭据是否可以处理，仍由使用者按具体权限判断。",
  limitations:
    "不内置图像模型，不保证审美、文字准确或平台兼容；ASCII草图只表达关系，自动校验不能替代版权、隐私和人工视觉验收。",
};
