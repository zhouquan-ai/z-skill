# 屏幕常亮

一款轻量的 Windows 桌面工具，可保持屏幕常亮并设置定时关闭。

## 当前版本

- 版本：`v1.1.0-candidate.1`
- 状态：z-skill 公开候选
- 平台：Windows 10/11 x64
- 网络：无网络请求、无账号、无遥测

## 使用

1. 可选择预设或自定义时长；不选择即不定时。
2. 点击“开启常亮”。
3. 关闭窗口时，可选择退出或最小化到托盘，并可记住选择。
4. 已记住的关闭方式可在托盘菜单“关闭窗口时”中修改。

## 开发

```powershell
npm install
npm test
npm run check
npm start
```

构建 Windows x64 便携版：

```powershell
npm run build:portable
```

## 文档

- `PRIVACY.md`
- `KNOWN_LIMITATIONS.md`
- `THIRD_PARTY_NOTICES.md`
- `TEST_MATRIX.md`
- `TEST_REPORT.md`

## 交付结构

- 面向普通用户的 ZIP 只包含 `屏幕常亮.exe`；
- 本目录保存源码快照、测试记录、隐私说明、限制说明和许可证，供审查与重建。
