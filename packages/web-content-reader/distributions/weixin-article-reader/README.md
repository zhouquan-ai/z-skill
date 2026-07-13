# Weixin Article Reader

Weixin Article Reader 用于批量读取用户明确提供的微信公众号文章链接，保留标题、作者、发布时间、正文和逐篇状态。

## 安装

1. 阅读本包的隐私说明和已知限制。
2. 将`skill/weixin-article-reader`复制到当前Agent认可的Skills目录。
3. 确认OpenCLI微信公众号适配器可用；BrowserAct只作为已配置环境中的可选回退。
4. 使用无敏感信息的完整分享链接做最小测试，并检查`manifest.json`。

## 边界

本Skill不负责公众号站内搜索、账号登录、验证码处理或代理资源。正文提取成功后，重要内容仍应回看原网页。

当前公开候选版本为`v0.1.0-candidate.1`。
