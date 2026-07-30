# 飞书远程调用本地AI

这个 Workflow 说明如何把飞书消息安全地桥接到一个限定工作区内的本地 AI：先过滤消息、核验身份和权限、去重，再执行受限任务，并通过 Git 与回包记录完成验收。

当前为 `v0.1.0-candidate.1` 公开候选包，已进入z-skill公开目录。

## 它解决什么

- 将飞书事件入口、桥接层、本地 AI、工作区和回包验收分层；
- 使用环境变量占位符保存凭据，配置文件不写真实 App 信息；
- 限制私聊、允许用户、命令前缀、权限等级和工作区根；
- 用事件编号去重，避免重复执行；
- 写操作前后记录 Git 状态、文件哈希和回包结果；
- 提供完全离线的测试仓库冒烟示例。

它不是“一键远程控制电脑”。公开包不连接真实飞书，不启动真实 AI，不包含 cc-connect、飞书 SDK、lark-cli、Codex CLI 或其他第三方代码。

## 安装

将 `skill/feishu-local-ai-bridge` 复制到当前 Agent 的 skills 目录。先阅读架构、权限矩阵和配置模板，再在隔离测试仓库运行离线冒烟。

## 离线冒烟

```powershell
python skill/feishu-local-ai-bridge/scripts/smoke_bridge.py `
  --config examples/config.smoke.toml `
  --events examples/events.smoke.json `
  --workspace examples/smoke-repo `
  --state outputs/dedup.json `
  --audit outputs/audit.jsonl
```

真实接入前必须重新核对所选飞书事件方式、桥接实现、本地 AI 工具及其当前版本和权限。

使用前阅读 `PRIVACY.md`、`KNOWN_LIMITATIONS.md` 和 `TEST_MATRIX.md`。
