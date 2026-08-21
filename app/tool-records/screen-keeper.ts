import type { ToolRecord } from "../tool-data";

const tag = "screen-keeper-v1.1.0-candidate.1";
const releaseUrl = `https://github.com/zhouquan-ai/z-skill/releases/download/${tag}/screen-keeper-v1.1.0-candidate.1.zip`;

export const screenKeeper: ToolRecord = {
  slug: "screen-keeper",
  name: "屏幕常亮",
  aliases: ["屏幕保持唤醒", "防止息屏", "screen keeper", "screen-keeper"],
  iconKey: "screen-keep",
  iconTone: "indigo",
  type: "Tool",
  packageMode: "Standalone",
  status: "公开候选",
  statusTone: "candidate",
  version: "v1.1.0-candidate.1",
  releasedAt: "2026-08-21T21:46:00+08:00",
  updated: "2026-08-21",
  author: "周全",
  license: "MIT",
  category: "桌面工具 · 屏幕管理",
  summary: "在需要阅读、演示或持续查看内容时保持屏幕常亮，并可设置定时停止。",
  detailSummary: "一款本地运行的 Windows 屏幕常亮工具：支持不限时、预设时长和自定义时长，关闭主窗口后可继续驻留系统托盘，并能记住关闭方式。",
  environments: ["Windows"],
  environmentNote: "Windows 10/11 x64 · 便携版 EXE",
  download: {
    path: releaseUrl,
    sourceUrl: releaseUrl,
    label: "下载 Windows x64 ZIP",
    fileType: "ZIP",
    sha256: "02ca1f648a5966f7e3795f361f5f9ce9fe8585493065e8187a7ff283f2ca0b37",
    delivery: "github-release",
    manifestPath: "packages/screen-keeper/release-manifest.json",
  },
  releaseResources: [
    { label: "查看源码", description: "查看与本候选版本对应的源码快照。", url: `https://github.com/zhouquan-ai/z-skill/tree/${tag}/packages/screen-keeper/source` },
    { label: "测试记录", description: "查看自动测试、冒烟测试和未验证边界。", url: `https://github.com/zhouquan-ai/z-skill/blob/${tag}/packages/screen-keeper/TEST_REPORT.md` },
    { label: "发布说明", description: "查看本版本的 GitHub Release 与下载制品。", url: `https://github.com/zhouquan-ai/z-skill/releases/tag/${tag}` },
  ],
  overview: {
    title: "需要时保持常亮，到时自动停止",
    description: "应用通过 Windows 的系统请求防止显示器自动休眠，不修改电源计划。用户可以不设时长，也可以使用预设或自定义分钟数；运行状态可从主窗口或托盘查看和停止。",
    scenarios: [
      "阅读长文档、材料或网页时防止屏幕自动熄灭",
      "演示、展示或持续观察信息时保持显示器常亮",
      "临时下载、传输或监看任务时设置定时停止",
      "不希望工具联网、注册账号或收集使用数据",
    ],
  },
  testNote: "5项核心逻辑测试、11项发布结构检查和应用冒烟测试通过；启停、定时、关闭询问、记住选择和托盘隐藏已验证并经人工验收。候选版未提供商业代码签名，也未验证Windows x64之外平台。",
  formatTests: [
    { format: "核心逻辑", status: "verified", label: "5/5 通过" },
    { format: "发布结构", status: "verified", label: "11项通过" },
    { format: "应用冒烟测试", status: "verified", label: "启停与托盘流程通过" },
    { format: "Windows 10/11 x64", status: "verified", label: "便携版验收通过" },
    { format: "其他系统与架构", status: "pending", label: "未验证" },
  ],
  usageSteps: [
    "下载ZIP并核对详情页SHA-256，解压后运行其中唯一的“屏幕常亮.exe”。",
    "选择预设时长、输入自定义分钟数，或不选择时长以持续运行。",
    "点击“开启常亮”；运行中可以查看剩余时间并随时停止。",
    "关闭主窗口时选择最小化到托盘或退出应用，也可以记住选择。",
    "需要恢复主窗口、停止常亮或重设关闭方式时，使用系统托盘菜单。",
  ],
  install: {
    intro: "用户下载包只包含一个Windows x64便携版EXE；源码、隐私说明、限制说明和测试报告可在本页独立查看。",
    steps: [
      "下载v1.1.0-candidate.1 ZIP，并核对详情页公布的SHA-256。",
      "解压到用户选择的本地目录，不要在压缩包内直接运行。",
      "如需审查，先打开详情页中的源码、测试记录和发布说明。",
      "经用户确认后运行“屏幕常亮.exe”。",
    ],
    fallback: "如果当前Agent不能运行Windows桌面程序，只需完成下载、哈希核对和解压，并把EXE位置交给用户手动启动。",
  },
  components: [],
  dependencies: [
    { name: "Windows 10/11 x64", role: "运行便携版桌面应用" },
    { name: "Windows 电源请求", role: "运行期间防止显示器自动休眠" },
    { name: "系统托盘", role: "隐藏主窗口后继续运行并恢复操作" },
  ],
  privacy: "应用不访问网络，不需要账号，不收集使用数据，不包含遥测或广告；仅在Electron用户数据目录保存关闭窗口时的处理方式，不读取文档内容或个人身份信息。",
  limitations: "仅支持Windows 10/11 x64；未提供开机自启，不记住上次常亮状态或定时时长；退出、重启或应用崩溃后常亮请求会终止；不能阻止用户主动锁屏、关机或硬件关闭显示器；便携版没有商业代码签名，可能触发未知发布者或SmartScreen提示。",
};
