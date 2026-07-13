---
name: weixin-article-reader
description: 批量读取用户明确提供的微信公众号文章链接，优先使用OpenCLI微信公众号适配器，失败时使用BrowserAct只读隐身提取，核对标题、作者、发布时间和正文完整性，并生成逐篇成功或失败清单。用户给出一个或多个mp.weixin.qq.com文章URL，要求阅读、总结、比较、学习写作特点或批量抓取正文时使用。不是公众号站内搜索工具，不负责创建草稿、发布文章、登录账号或购买代理。
---

# 微信公众号文章读取

## 执行流程

1. 确认输入是用户明确提供的微信公众号文章URL；未提供URL时请求补充，本Skill不负责站内搜索。
2. 运行OpenCLI预检，确认`weixin download`仍存在并读取实时帮助：

```powershell
opencli list -f yaml
opencli weixin -h
opencli weixin download -h
```

3. 单篇文章可直接运行`opencli weixin download`。两篇以上优先运行`scripts/batch_weixin_download.ps1`。保留用户提供的完整分享URL及查询参数，不自行截短；仅保留部分参数可能导出失败。
4. 默认将文件写入系统临时目录，并设置`--download-images false`。只有用户需要分析截图、视觉或排版时才下载图片。
5. 读取脚本生成的`manifest.json`。逐篇确认状态、标题、作者、发布时间、正文长度、警告和Markdown路径。
6. 成功文章再进入总结、比较或风格分析。不得仅凭命令退出码宣布读取成功。
7. 某篇正文读取成功但作者、发布时间等元数据缺失时，保留成功状态并报告警告，不把它描述为完全无异常。
8. OpenCLI最多尝试两次。仍失败且本机已配置BrowserAct API Key时，脚本再尝试两次`stealth-extract`；该备用路径不登录、不使用代理，也不创建隐身浏览器。
9. BrowserAct备用结果可能缺少结构化作者、发布时间或混入页面附属内容，必须继续执行元数据和正文边界检查，不得只看退出码。

## 批量命令

```powershell
& "skills/weixin-article-reader/scripts/batch_weixin_download.ps1" `
  -Urls @(
    "https://mp.weixin.qq.com/s/example1",
    "https://mp.weixin.qq.com/s/example2"
  )
```

需要指定输出位置时使用`-OutputDirectory`。单批默认上限20篇，串行执行、自动去重，并在清单中记录`Method`、主路径次数、备用路径次数和`RouteHistory`。排障时可用`-DisableOpenCli`或`-DisableStealthFallback`单独关闭相应路径。

## 输出与保存边界

- 临时读取不进入文章资料库，不更新台账，不下载图片文件。
- 用户明确要求保存时，再按工作区文章资料库规则决定目录、资料卡和索引联动。
- 不导入Chrome Profile，不自动处理验证码，不购买或使用代理。只读`stealth-extract`仅作为已获授权的正文提取备用路径。
- 正文抓取成功不代表内容事实正确；后续引用文章观点时仍需区分原文观点、作者经验和已核验事实。
- 查询结束时报告网站范围、批量URL数量、成功数、失败数和警告数。
