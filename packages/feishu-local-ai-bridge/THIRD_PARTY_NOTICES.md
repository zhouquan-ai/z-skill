# 第三方说明

本候选包未复制或再分发 cc-connect、飞书 SDK、lark-cli、Codex CLI 或其他第三方代码。

公开架构可以对接不同实现。已知可参考的外部入口包括：

- 飞书开放平台事件订阅与 Channel SDK 文档；
- cc-connect 项目（其仓库声明 MIT License）；
- lark-cli 与 Codex CLI。

本包只记录本地验证过的参考基线：cc-connect 1.4.1、lark-cli 1.0.72、codex-cli 0.144.5。它们不是本 ZIP 的依赖锁定或再分发许可，部署时应以各自当前官方说明为准。

离线冒烟脚本只使用 Python 3.11+ 标准库和 Git 命令行。
