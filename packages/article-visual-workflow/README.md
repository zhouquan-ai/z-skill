# 文章视觉规划与生图

这个 Skill 在调用任何图像模型之前，先把文章转化为可检查的视觉计划：视觉故事简报、图片路由、插入位置、ASCII 草图、生图提示、逐图验收和局部重做。

当前为 `v0.1.0-candidate.1` 公开候选包，已进入z-skill公开目录。

## 它解决什么

- 先判断图片承担的理解任务，再决定是否生成；
- 在场景图、示意图和“不配图”之间路由；
- 用插入位置、ASCII 草图和场景执行卡减少方向性返工；
- 一张图一次验收，失败时只重做当前图；
- 保留“没有理解价值时不生成”的停止条件。

它不内置图像模型，也不承诺稳定生成好图。图像生成、确定性示意图渲染和最终审美判断由使用者选择的工具及人工验收完成。

## 安装

将 `skill/article-visual-workflow` 复制到当前 Agent 的 skills 目录。仿真文章、计划样例和校验脚本位于 `examples/`、`assets/` 与 `scripts/`。

## 最小使用

1. 提供一篇已经冻结内容的 Markdown 文章；
2. 让 Agent 先输出视觉故事简报和图片路由，不立即生图；
3. 确认每张图的插入位置、用途、执行卡或 ASCII 草图；
4. 再逐图生成、验收，失败时只重做当前图；
5. 用 `scripts/validate_plan.py` 检查计划结构和正文锚点。

```powershell
python skill/article-visual-workflow/scripts/validate_plan.py `
  --article examples/synthetic-article-argument.md `
  --plan examples/expected/planning-argument.md
```

使用前阅读 `PRIVACY.md`、`KNOWN_LIMITATIONS.md` 和 `TEST_MATRIX.md`。
