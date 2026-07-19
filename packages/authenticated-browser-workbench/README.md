# Authenticated Browser Workbench

Authenticated Browser Workbench 是一份把通用 BrowserSkill 改造成个人登录态浏览工作台的公开候选模板。它不复制 BrowserSkill 的浏览器控制能力，而是在外层补充任务分流、浏览器与账号边界、站点矩阵、故障回退和结果验收。

## 适用场景

- 复用已经登录的浏览器进行站内搜索、后台只读检查或页面交互；
- 同时使用多个 Chromium 浏览器或多个账号，需要避免选错实例；
- 把验证码、账号归属、禁止页面和外部动作确认写成长期规则；
- 把一次排障经验沉淀为可替换的站点矩阵，而不是每次重新试错。

普通公开网页或公开文章不应仅因浏览器已经登录就改走本模板。优先使用成本更低、隐私边界更清楚的公开网页读取工具。

## 安装

1. 先按 BrowserSkill 官方说明安装 `bsk` CLI、浏览器扩展和上游 `browser-skill` Skill：<https://github.com/Tencent/BrowserSkill>。
2. 将本包中的 `skill/authenticated-browser-workbench` 复制到当前 Agent 的 skills 目录。
3. 编辑 `references/browser-profile.md`，写入自己的浏览器用途和账号禁区；不要写密码、Cookie、Token或恢复码。
4. 编辑 `references/site-matrix.md`，只登记亲自验证过的站点能力、日期和限制。
5. 重新加载 Agent，用一个无副作用的登录态搜索任务做最小验证。

## 最小验证

1. 运行 `bsk browsers --json`，确认目标浏览器在线；多个实例在线时显式选择目标实例。
2. 新建 BrowserSkill Agent 会话，打开一个已经登录的站点搜索页。
3. 先取 snapshot，确认登录后控件和结果列表均可见。
4. 停止会话，再运行 `bsk session list --json`，确认活动会话为零。

Windows 用户可以运行包内稳定性诊断脚本：

```powershell
pwsh -NoProfile -File .\skill\authenticated-browser-workbench\scripts\Test-BrowserSkillConnectionStability.ps1 -DurationSeconds 180
```

脚本只汇总浏览器数量、连接周期、版本和命令错误，不输出浏览器实例 ID。它不修改 BrowserSkill 扩展。

## 版本状态

当前为 `v0.1.0-candidate.1` 公开候选版。候选版表示模板、下载包、隐私边界和基本回归已经公开，但尚未覆盖更多操作系统、浏览器版本、休眠唤醒和长任务场景。测试范围见 `TEST_MATRIX.md`，风险见 `KNOWN_LIMITATIONS.md`。
