# 微信公众号半自动排版

`wechat-article-layout` 是一个可离线运行的候选 Workflow，也是公开候选包，已进入z-skill公开目录。它把冻结 Markdown、配套图片和交接清单转成：

- `preview.html`：本地桌面与移动端预览；
- `copyable.html`：图片以内嵌 data URI 表示的可复制内容；
- `validation-report.json`：输入、结构、图片和人工验收状态；
- `build-receipt.json`：输入与输出的 SHA-256、构建结论和边界声明。

它解决的是“同一篇冻结稿是否使用了正确图片、是否生成了可核验交付物”，不会调用微信公众号 API，不会创建草稿、排期或发布。

## 快速开始

需要 Python 3.11+，不安装第三方依赖。

```powershell
python skill/wechat-article-layout/scripts/build_layout.py `
  --article examples/frozen-article.md `
  --images examples/images `
  --handoff examples/handoff.json `
  --output output/demo
```

构建前可先只校验：

```powershell
python skill/wechat-article-layout/scripts/build_layout.py `
  --article examples/frozen-article.md `
  --images examples/images `
  --handoff examples/handoff.json `
  --output output/demo `
  --validate-only
```

然后打开 `output/demo/preview.html` 检查本地效果。把 `copyable.html` 中的正文复制到公众号编辑器后，仍须在真实编辑器中保存重开，并以手机预览完成人工终审。`handoff.json` 中的 `mobile_acceptance` 只能记录人工结果，构建器不会自动把它改成通过。

## 输入约定

- Markdown 必须是冻结稿，UTF-8 编码；
- 图片引用只能使用 `images/<文件名>` 相对路径，且文件必须位于指定图片目录；
- 交接清单必须包含 `article_id`、`frozen: true`、`expected_images` 与 `mobile_acceptance`；
- `expected_images` 必须与正文实际引用一一对应；
- 原始 HTML、远程图片和 data URI 输入会被拒绝。

## 产物边界

本包使用一个克制的 Markdown 子集：标题、段落、引用、无序/有序列表、强调、行内代码、链接和图片。它不会改写文章事实，也不会替代公众号编辑器或手机端视觉判断。

详见 `PRIVACY.md`、`KNOWN_LIMITATIONS.md`、`TEST_MATRIX.md` 和 Workflow 内的验收清单。
