# 简历库与简历管理

这个 Workflow 把简历制作拆成来源、事实、模块、岗位画像和输出五层，先维护可追溯的职业事实，再为不同目标岗位选择和压缩表达。

当前为 `v0.1.0-candidate.1` 公开候选包，已进入z-skill公开目录。

## 它解决什么

- 登记材料来源、证据等级、核验状态和冲突；
- 把经历、项目和案件保存为职业事实，不在事实层做营销性改写；
- 将案件客观事实、本人动作和团队贡献分开；
- 从事实编号生成可复用经历模块；
- 根据岗位画像选择模块，形成不同目标的简历草稿；
- 让每份输出保留事实引用和人工审阅状态。

公开包中的履历、单位、项目、案件、时间和数字均为仿真数据。它不包含真实简历、证明材料、个人信息、薪酬或案件资料。

## 安装

将 `skill/resume-library-management` 复制到当前 Agent 的 skills 目录。仿真履历和多目标输出示例位于 `examples/`，可选的本地校验脚本位于 `scripts/`。

## 最小使用

1. 复制 `assets/library-template.json` 建立自己的库；
2. 先登记来源，再将候选内容写入事实层；
3. 标记证据等级、核验状态、冲突和外部审阅提示；
4. 从事实编号建立经历或案件模块；
5. 使用岗位画像选择模块，生成带引用的目标简历；
6. 用本地脚本检查引用、贡献边界和隐私风险。

```powershell
python skill/resume-library-management/scripts/validate_library.py `
  --library examples/synthetic-library.json
```

使用前阅读 `PRIVACY.md`、`KNOWN_LIMITATIONS.md` 和 `TEST_MATRIX.md`。
