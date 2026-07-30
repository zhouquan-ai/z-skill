import type { ToolRecord } from "../tool-data";

export const authenticatedWebSearch: ToolRecord = {
  slug: "authenticated-web-search",
  name: "登录态网页检索",
  aliases: ["登录态增强检索", "Authenticated Browser Workbench", "authenticated-browser-workbench", "authenticated-web-search"],
  legacySlugs: ["authenticated-browser-workbench"],
  iconKey: "secure-search",
  iconTone: "violet",
  type: "Skill",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.3",
  releasedAt: "2026-07-19T14:42:43+08:00",
  updated: "2026-07-19",
  author: "周全",
  license: "MIT",
  category: "信息获取 · 登录态网页检索",
  summary: "普通网页搜索不够时，让AI安全复用你已登录的网站继续收集和交叉核验资料。",
  detailSummary: "先用AI默认网页搜索；信息不足时，再按问题类型选择登录态内容平台或AI搜索网页，并管理浏览器、账号、隐私边界和失败回退。",
  environments: ["Codex"],
  environmentNote: "Codex · Windows · Chrome / Chromium",
  download: {
    path: "/downloads/authenticated-web-search-v0.1.0-candidate.3.zip",
    sourceUrl:
      "https://raw.githubusercontent.com/zhouquan-ai/z-skill/main/public/downloads/authenticated-web-search-v0.1.0-candidate.3.zip",
    label: "下载候选版 ZIP",
    fileType: "ZIP",
    sha256: "77937d44f9356a19f73169135dc499304cae5ca9acdb111c4e330e4d1e33b7f9",
  },
  overview: {
    title: "让AI默认搜索在信息不足时继续向前",
    description:
      "AI默认网页搜索负责公开信息，BrowserSkill负责连接和操作浏览器，本Skill负责判断何时需要升级检索、进入哪个登录态网站、使用哪个浏览器和账号，以及怎样分层核验结果。",
    scenarios: [
      "公开搜索只有转载、摘要或过期资料时继续寻找有效信息",
      "补充评价、口碑、真实体验和平台内近期讨论",
      "复用已登录浏览器进行站内搜索和后台只读检查",
      "在多个浏览器和账号之间建立明确的使用边界",
      "把站点差异、失败经验和替代路径写成长期规则",
    ],
  },
  testNote: "公开搜索充分性、真实体验补充和AI网页线索三类规则回放通过；Chrome 150与豆包浏览器Chromium 135已完成登录态只读检索、完整重启和会话清理。",
  formatTests: [
    { format: "公开搜索充分性与渠道路由", status: "verified", label: "三类代表性规则回放通过" },
    { format: "Chrome 150登录态只读检索", status: "verified", label: "当前Windows环境通过" },
    { format: "豆包浏览器Chromium 135", status: "verified", label: "当前Windows环境通过" },
    { format: "浏览器完整重启", status: "verified", label: "两款浏览器均通过" },
    { format: "多实例显式选择与会话清理", status: "verified", label: "当前样本通过" },
    { format: "休眠唤醒与长任务", status: "pending", label: "候选期继续观察" },
    { format: "macOS / Linux", status: "pending", label: "尚未验证" },
  ],
  usageSteps: [
    "先按BrowserSkill官方说明安装bsk CLI、浏览器扩展和上游browser-skill。",
    "解压候选包，把skill/authenticated-web-search复制到当前Agent的skills目录。",
    "填写browser-profile.md和site-matrix.md，定义公开搜索不足后应选择的登录态渠道；不写凭据和私密页面内容。",
    "回放一次无需浏览器的充分搜索和一次登录态补充检索，再验证实例选择、可见结果和会话停止。",
  ],
  install: {
    intro: "候选包提供AI默认搜索之外的登录态网页检索层，不捆绑BrowserSkill本体。可以复制安装指令，也可以直接下载ZIP。",
    steps: [
      "下载并解压v0.1.0-candidate.3 ZIP，阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_MATRIX.md。",
      "按https://github.com/Tencent/BrowserSkill的当前说明安装bsk CLI、扩展和上游browser-skill。",
      "将skill/authenticated-web-search复制到当前Agent的skills目录。",
      "填写浏览器用途、账号硬边界、站点矩阵和检索升级条件；不要写入密码、Cookie、Token、本机Profile路径或实例ID。",
      "重新加载Agent，验证公开搜索充分时不启动浏览器、信息不足时只选择必要渠道，并确认登录态任务结束后活动会话为零。",
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
    "必须另行安装BrowserSkill；隐式调用取决于宿主Agent；其他Chromium浏览器需逐机验证；休眠唤醒、长任务、macOS和Linux尚未测试，也不承诺所有登录网站可用。",
};
