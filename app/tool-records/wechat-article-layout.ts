import type { ToolRecord } from "../tool-data";

export const wechatArticleLayout: ToolRecord = {
  slug: "wechat-article-layout",
  name: "微信公众号半自动排版",
  aliases: ["公众号排版", "微信文章排版", "半自动排版", "wechat-article-layout"],
  iconKey: "article-read",
  iconTone: "teal",
  type: "Workflow",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.1",
  releasedAt: "2026-07-30T18:33:18+08:00",
  updated: "2026-07-30",
  author: "周全",
  license: "MIT",
  category: "内容生产 · 公众号排版",
  summary: "把冻结Markdown、图片和交接清单构建为本地预览、可复制内容、校验报告与哈希回执。",
  detailSummary:
    "用确定性输入、图片清单和SHA-256控制每篇文章的版本，自动生成本地预览与复制材料，并把公众号编辑器和手机人工终审保留为明确验收层。",
  environments: ["Codex"],
  environmentNote: "Python 3.11+ · 浏览器本地预览 · 微信公众号编辑器（人工）",
  download: {
    path: "/downloads/wechat-article-layout-v0.1.0-candidate.1.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/wechat-article-layout-v0.1.0-candidate.1.zip",
    label: "下载候选版 ZIP",
    fileType: "ZIP",
    sha256: "bf2d746ec512d2a83f74a0cfaf8ddae2f6464f050f1937fa7ee87fd8fb00bf15",
  },
  overview: {
    title: "把自动校验和手机人工终审放到各自适合的位置",
    description:
      "Workflow只接受冻结稿、正式图片和交接清单；本地构建负责结构、图片、哈希与回执，真实公众号编辑器和手机预览负责最终视觉判断。",
    scenarios: [
      "为冻结Markdown生成桌面与移动端本地预览",
      "把配套图片内嵌到可复制HTML中",
      "用文章ID、输入哈希和输出哈希防止版本混用",
      "在自动校验后保留公众号编辑器与手机人工终审",
    ],
  },
  testNote:
    "7项Python标准库测试覆盖确定性构建、输入输出哈希、缺图、清单不一致、未冻结稿、远程图片、原始HTML和人工验收状态；未调用公众号API。",
  formatTests: [
    { format: "冻结Markdown与仿真图片", status: "verified", label: "离线构建通过" },
    { format: "预览、复制内容与构建回执", status: "verified", label: "确定性测试通过" },
    { format: "缺图、错图与未冻结输入", status: "verified", label: "拒绝用例通过" },
    { format: "桌面与窄屏本地预览", status: "verified", label: "浏览器验收通过" },
    { format: "真实公众号编辑器与手机预览", status: "pending", label: "需逐篇人工验收" },
  ],
  usageSteps: [
    "解压候选包，阅读README、隐私说明、测试记录和已知限制。",
    "将skill/wechat-article-layout复制到当前Agent的skills目录。",
    "冻结Markdown与正式图片，并按模板填写文章ID、图片清单和人工验收状态。",
    "先运行validate-only，再生成preview.html、copyable.html、校验报告和构建回执。",
    "在公众号编辑器中人工粘贴、保存重开并完成手机预览；不要把本地构建成功记成页面完成。",
  ],
  install: {
    intro: "候选包提供独立Python标准库Workflow、仿真稿件与图片、交接模板、验收清单和7项离线测试，不包含公众号凭据或第三方排版代码。",
    steps: [
      "下载并解压v0.1.0-candidate.1 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
      "将skill/wechat-article-layout复制到当前Agent的skills目录。",
      "按assets模板准备冻结Markdown、images目录和handoff.json，先运行--validate-only。",
      "正式构建后核对preview.html、copyable.html、validation-report.json和build-receipt.json。",
      "人工粘贴到公众号编辑器，保存重开并完成手机预览，再记录人工验收结论。",
    ],
    fallback: "如果当前Agent不支持Workflow安装，可直接运行Python脚本，并使用人工验收清单完成公众号端复核。",
  },
  components: [],
  dependencies: [
    { name: "Python 3.11+", role: "离线校验、渲染、图片内嵌和SHA-256回执" },
    { name: "现代浏览器", role: "打开本地预览与可复制内容" },
    { name: "微信公众号编辑器", role: "人工粘贴、保存重开与页面检查；本包不调用API" },
    { name: "手机预览", role: "人工检查真实阅读宽度、段距、图片节奏和整体视觉" },
  ],
  privacy:
    "所有处理均在本地完成；包内只有仿真文章与图片，不含真实正文、账号、凭据、私人样式参数或未公开素材。可复制HTML会内嵌完整图片，应按敏感交付物保管。",
  limitations:
    "不支持自动发布、草稿箱API、图片API、排期或无人值守操作；Markdown子集、浏览器复制和微信渲染均有边界，自动校验不能替代真实编辑器与手机人工验收。",
};
