---
name: web-content-reader
description: 批量读取用户明确提供的网页URL，按网站类型在专用适配器、Trafilatura轻量直取、BrowserAct本地浏览器和只读隐身提取之间逐级路由，提取Markdown正文并检查标题、正文长度、访问限制和页面噪声。用户要求读取、保存、总结、比较或学习一批网页内容时使用，尤其适用于微信公众号与普通网页混合链接。不是网页站内搜索工具，不负责登录账号、购买代理或规避需要身份授权的访问控制。
---

# 网页内容批量读取

## 路由顺序

1. 确认用户已经提供明确URL；未提供时请求补充，本Skill不负责搜索网页。
2. 已有网站专用适配器时优先使用。微信公众号文章调用`../weixin-article-reader/scripts/batch_weixin_download.ps1`，并保留完整分享URL；其内部以OpenCLI为主、BrowserAct只读隐身提取为备用。
3. 普通静态网页先用Trafilatura直取。该路径速度快、正文噪声少，但不能处理需要JavaScript渲染或访问验证的页面；出现正文过短或限制页时自动回退。
4. 轻量直取取得页面但正文识别不足时，调用已有的BrowserAct本地空白Chrome，按“打开、等待稳定、定位正文容器、转换Markdown、关闭会话”的顺序串行处理。
5. 轻量直取返回空结果或验证页时，跳过低价值的本地重复尝试，直接使用已配置API Key的`browser-act stealth-extract`；本地浏览器仍失败时也进入该路径。隐身提取默认最多尝试三次，每次设置45秒硬超时，并将渲染后的HTML再次交给Trafilatura清洗正文。不得自动购买代理、创建隐身浏览器、导入资料或登录账号。

## 批量执行

两篇以上或混合网站URL，运行：

```powershell
& "skills/web-content-reader/scripts/batch_web_content.ps1" `
  -Urls @(
    "https://mp.weixin.qq.com/s/example",
    "https://example.com/article"
  )
```

默认写入系统临时目录，单批上限20篇，自动去重。每篇按需尝试轻量直取、本地浏览器和隐身提取，并在清单中记录`Method`、`Attempts`和`RouteHistory`。运行目录和BrowserAct会话均使用唯一标识；同一个本地BrowserAct浏览器不要同时运行多个批次。需要保存时再指定`-OutputDirectory`。

轻量直取依赖本机`uv tool install trafilatura`生成的隔离运行环境。缺少该环境时不自动安装，直接跳过并使用浏览器路径。排障时可用`-DisableDirectExtraction`、`-DisableLocalBrowser`或`-DisableStealthFallback`单独关闭相应路径；只有明确需要调整失败收尾时，才传入`-StealthTimeoutSeconds`修改单次隐身提取上限。

本地浏览器路径默认不绑定个人浏览器名称。需要使用时，通过`-BrowserName`传入已有BrowserAct浏览器，或设置`BROWSERACT_BROWSER_NAME`环境变量。创建、导入或更换浏览器前，应先取得用户确认；脚本本身不得创建或导入浏览器。

## 验收要求

1. 读取`manifest.json`，不得仅凭命令退出码宣布成功。
2. 逐篇核对URL、标题、正文范围`ContentScope`、净化前后长度、行数、链接数量、提取方式、路由历史、警告和错误。
3. 将正文过短、访问限制、登录或验证页面标记为失败或异常，不得当作文章正文。
4. 某篇失败不阻断整批；自动重试后仍失败则如实报告。
5. 微信公众号文章同时核对公众号作者和发布时间；普通网页不能稳定提供这些字段时不得自行补写。
6. `PossibleNavigationNoise`为`true`时，检查导航、页脚和推荐链接是否混入正文；该字段只是启发式提示，不能直接判定提取失败。
7. 重要内容用于引用前，仍须区分原文观点、作者经验和已核验事实。

## 保存边界

- 临时读取不写入项目文章库、台账或长期资料目录。
- 用户要求保存时，保留Markdown正文和批量清单；是否下载图片由用户目的决定。
- 不登录网站，不导入Cookie或Chrome Profile，不自动处理验证码，不购买或使用代理。只读隐身提取只处理用户明确提供的公开网页。
- 稳定性优先于速度。默认一次只运行一个批次，不因为BrowserAct支持多会话就自行开启并发。
- 查询结束时报告网站范围、URL数量、成功数、失败数、重试数和异常页面。
