import type { ToolRecord } from "../tool-data";

const releaseUrl = "https://github.com/zhouquan-ai/z-skill/releases/download/eye-break-reminder-v0.1.0-candidate.5/eye-break-reminder-v0.1.0-candidate.5.zip";

export const eyeBreakReminder: ToolRecord = {
  slug: "eye-break-reminder",
  name: "护眼提醒",
  aliases: ["护眼", "休息提醒", "看远处", "eye-break-reminder"],
  iconKey: "eye-break",
  iconTone: "sky",
  type: "Tool",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v0.1.0-candidate.5",
  releasedAt: "2026-08-20T16:57:05+08:00",
  updated: "2026-08-20",
  author: "周全",
  license: "MIT",
  category: "桌面工具 · 健康提醒",
  summary: "按自定义间隔提醒看向远处，支持本地设置、置顶倒计时、运行锁定和系统托盘。",
  detailSummary:
    "一款本地运行的 Windows 护眼提醒工具：自由设置提醒间隔与放松时长，运行时锁定配置，到点显示简洁倒计时，并可在关闭窗口后继续驻留系统托盘。",
  environments: ["Windows"],
  environmentNote: "Windows x64 · 便携版 EXE",
  download: {
    path: releaseUrl,
    sourceUrl: releaseUrl,
    label: "下载 Windows x64 ZIP",
    fileType: "ZIP",
    sha256: "89ed8b25cceab5436fd4cf447997009c7cb830dedcf13361ff78ab7eb5b87742",
    delivery: "github-release",
    manifestPath: "packages/eye-break-reminder/release-manifest.json",
  },
  overview: {
    title: "让周期性休息提醒保持简单、可控",
    description:
      "提醒间隔和放松时长由用户自由输入；开始后设置立即锁定，暂停后才能修改。主窗口可最小化到系统托盘，提醒仍在本机继续运行。",
    scenarios: [
      "长时间处理文档、阅读材料或编写代码时定时休息",
      "按个人习惯设置提醒间隔和看远处时长",
      "关闭主窗口后让提醒继续驻留系统托盘",
      "不希望健康提醒工具上传使用数据或依赖账号",
    ],
  },
  testNote:
    "7项核心逻辑测试和11项发布文件检查通过，npm audit为0；Windows x64便携版已完成托盘最小化、单实例恢复、残留弹窗回归和真正退出的真实进程验证，并经人工验收。真实硬件休眠与系统锁屏未列为本次已验证项。",
  formatTests: [
    { format: "核心逻辑", status: "verified", label: "7/7 通过" },
    { format: "发布文件", status: "verified", label: "11/11 通过" },
    { format: "Windows x64 便携版", status: "verified", label: "真实进程回归通过" },
    { format: "系统托盘与关闭选择", status: "verified", label: "人工验收通过" },
    { format: "真实休眠与系统锁屏", status: "pending", label: "本轮未做物理场景验证" },
  ],
  usageSteps: [
    "下载ZIP并核对详情页SHA-256，解压后运行bin目录中的Windows x64便携版EXE。",
    "输入提醒间隔和放松时长；默认分别为40分钟和60秒。",
    "点击“开始提醒”；运行期间设置锁定，暂停后可以重新修改。",
    "提醒出现后看向远处，等待倒计时结束或点击“完成”。",
    "关闭主窗口时选择最小化到托盘或退出；可按需记住选择，并可从托盘恢复询问。",
  ],
  install: {
    intro: "候选包包含Windows x64便携版EXE、可审查源码、隐私说明、限制说明和测试报告，不需要安装程序或账号。",
    steps: [
      "下载v0.1.0-candidate.5 ZIP，并核对详情页公布的SHA-256。",
      "解压到用户选择的本地目录，不要在压缩包内直接运行。",
      "阅读README.md、PRIVACY.md、KNOWN_LIMITATIONS.md和TEST_REPORT.md。",
      "经用户确认后运行bin/eye-break-reminder-0.1.0-candidate.5-x64.exe。",
    ],
    fallback: "如果当前Agent不能运行Windows桌面程序，只需完成下载、哈希核对和解压，并把EXE位置交给用户手动启动。",
  },
  components: [],
  dependencies: [
    { name: "Windows x64", role: "运行便携版桌面应用" },
    { name: "系统托盘", role: "关闭主窗口后继续提醒并恢复主页面" },
  ],
  privacy:
    "应用完全在本机运行，不需要账号，不包含网络请求、统计、遥测或广告；仅在本机保存提醒间隔、放松时长、窗口位置和可选关闭偏好，不读取用户文档、浏览记录或屏幕内容。",
  limitations:
    "仅支持Windows x64；未提供开机自启、声音提醒或跨设备同步；重启后保持暂停；便携版未使用商业代码签名证书，可能触发未知发布者或SmartScreen提示；真实硬件休眠与系统锁屏未列为本次已验证项；本工具不构成医疗建议。",
};
