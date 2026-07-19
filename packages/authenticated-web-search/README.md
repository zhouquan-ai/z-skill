# 登录态网页检索

登录态网页检索是AI默认网页搜索的补充层。公开搜索足够时不启动浏览器；信息不足、需要真实体验或关键内容必须登录时，再调用BrowserSkill进入使用者已经登录的网站补充检索。

AI默认搜索负责公开信息，BrowserSkill负责连接和操作浏览器，本Skill负责判断何时需要升级检索、选择哪个登录态渠道和账号、怎样保护隐私、如何分层验证结果以及何时停止。它不复制BrowserSkill的浏览器控制能力。

## 适用场景

- 复用已经登录的浏览器进行站内搜索、后台只读检查或页面交互；
- 普通网页搜索只有重复转载、营销页面或过期资料，需要继续寻找有效来源；
- 问题需要评价、口碑、真实体验、近期讨论或平台原生内容；
- 同时使用多个 Chromium 浏览器或多个账号，需要避免选错实例；
- 把验证码、账号归属、禁止页面和外部动作确认写成长期规则；
- 把一次排障经验沉淀为可替换的站点矩阵，而不是每次重新试错。

普通公开网页或公开文章不应仅因浏览器已经登录就改走本模板。优先使用成本更低、隐私边界更清楚的公开网页读取工具。

## 安装

1. 先按 BrowserSkill 官方说明安装 `bsk` CLI、浏览器扩展和上游 `browser-skill` Skill：<https://github.com/Tencent/BrowserSkill>。
2. 将本包中的 `skill/authenticated-web-search` 复制到当前 Agent 的 skills 目录。
3. 编辑 `references/browser-profile.md`，写入自己的浏览器用途和账号禁区；不要写密码、Cookie、Token或恢复码。
4. 编辑 `references/site-matrix.md`，只登记亲自验证过的站点能力、日期和限制。
5. 重新加载 Agent，分别回放“公开搜索已足够，不启动浏览器”和“公开搜索不足，选择一个登录态渠道补充”两个场景，再用一个无副作用的登录态搜索任务做最小验证。

## 最小验证

1. 运行 `bsk browsers --json`，确认目标浏览器在线；多个实例在线时显式选择目标实例。
2. 新建 BrowserSkill Agent 会话，打开一个已经登录的站点搜索页。
3. 先取 snapshot，确认登录后控件和结果列表均可见。
4. 停止会话，再运行 `bsk session list --json`，确认活动会话为零。

Windows 用户可以运行包内稳定性诊断脚本：

```powershell
pwsh -NoProfile -File .\skill\authenticated-web-search\scripts\Test-BrowserSkillConnectionStability.ps1 -DurationSeconds 180
```

脚本只汇总浏览器数量、连接周期、版本和命令错误，不输出浏览器实例 ID。它不修改 BrowserSkill 扩展。

## 版本状态

当前为 `v0.1.0-candidate.3` 公开候选版。候选版采用“登录态网页检索”作为统一展示名，并将技术标识调整为 `authenticated-web-search`；旧标识 `authenticated-browser-workbench` 仅用于兼容候选阶段的历史链接。功能、测试边界和隐私约束保持不变；尚未覆盖更多操作系统、浏览器版本、休眠唤醒和长任务场景。测试范围见 `TEST_MATRIX.md`，风险见 `KNOWN_LIMITATIONS.md`。
