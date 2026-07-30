---
name: feishu-local-ai-bridge
description: Design and validate a least-privilege bridge from Feishu messages to a local AI workspace with filtering, deduplication, Git audit, and end-to-end readback.
---

# 飞书远程调用本地AI

## 目标

在不暴露凭据、不扩大主机权限的前提下，把经过过滤的飞书消息交给限定工作区内的本地 AI，并保留可追溯回包。这个 Workflow 只定义桥接边界和验收，不把消息入口包装成远程控制电脑。

## 架构

1. 飞书入口：接收事件或 Channel 消息，验证签名与应用权限。
2. 消息过滤：限制私聊、允许用户、命令前缀、文本长度和附件类型。
3. 去重：按稳定事件编号记录处理状态，重复事件不再次执行。
4. 权限路由：区分只读、工作区写入和禁止动作。
5. 本地 AI 适配器：只向一个显式工作区传递必要上下文。
6. Git 与审计：写前记录基线，写后记录变更路径、哈希和验证结果。
7. 回包：只返回结果摘要、验证状态和必要的下一步。

先读 `assets/architecture.md`、`assets/permission-matrix.md` 和 `assets/config.example.toml`。

## 默认边界

- 默认只读；
- 默认仅私聊；
- 默认拒绝未知用户、群聊、附件和无前缀消息；
- 默认不允许 Shell、桌面控制、浏览器控制、系统目录和工作区外路径；
- 写操作必须由消息明确表达，并同时通过权限、路径和工作区 Git 基线检查；
- 不得把凭据、环境变量、完整日志、私人文件或历史消息回传飞书。

## 去重与状态

使用飞书事件编号作为去重键。状态至少区分`received`、`filtered`、`accepted`、`completed`和`failed`。持久化存储需使用原子更新或数据库；公开冒烟只用本地 JSON 演示。

## Git 留痕

写操作前：

1. 确认目标目录是允许工作区；
2. 记录`git status --short`基线；
3. 识别并保护用户已有修改；
4. 冻结允许修改的相对路径。

写操作后：

1. 记录实际修改路径与文件SHA-256；
2. 运行最小验证；
3. 回读目标文件或产品状态；
4. 只在项目规则允许时创建范围精确的提交；
5. 回包不得宣称未经验证的成功。

## 真实接入门槛

- 飞书应用权限最小化并完成端到端回包；
- 凭据只来自秘密管理或环境变量；
- 桥接服务、AI适配器和工作区均有明确版本；
- 处理程序可安全重启，重复事件不会重复写入；
- 审计日志去敏且有保留期限；
- 在隔离测试仓库通过只读、写入、拒绝、重复和失败回放；
- 明确关闭流程，远程会话不能自行停止承载它的桥接进程。

## 离线冒烟

`scripts/smoke_bridge.py`只演示过滤、去重、工作区路径、Git状态和审计。它不会连接飞书或调用 AI。

```powershell
python scripts/smoke_bridge.py --config examples/config.smoke.toml --events examples/events.smoke.json --workspace examples/smoke-repo --state outputs/dedup.json --audit outputs/audit.jsonl
```
