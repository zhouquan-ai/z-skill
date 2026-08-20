# 护眼提醒

护眼提醒是一款面向 Windows x64 的轻量桌面工具。它按设定间隔提醒用户看向远处，并用简洁倒计时完成一次放松。

## 当前版本

- 版本：`v0.1.0-candidate.5`
- 状态：公开候选
- 技术：Electron + 原生 HTML/CSS/JavaScript
- 分发：Windows x64 便携版 EXE，随 ZIP 提供可审查源码
- 网络：无网络请求、无账号、无统计、无遥测、无广告

## 使用方式

1. 解压 ZIP，运行 `bin/eye-break-reminder-0.1.0-candidate.5-x64.exe`。
2. 输入提醒间隔和放松时长；默认分别为 40 分钟和 60 秒。
3. 点击“开始提醒”。运行期间设置会锁定，暂停后才能修改。
4. 到点后会显示置顶提醒，可等待倒计时结束或点击“完成”。
5. 关闭主窗口时可选择最小化到托盘或退出，也可以记住该选择。

首次运行时，Windows 可能因应用未使用商业代码签名证书而显示未知发布者或 SmartScreen 提示。请先在 z-skill 详情页核对版本与 SHA-256。

## 包内内容

- `bin/`：已验收的 Windows x64 便携版程序；
- `source/`：用于审查和重建的项目源码；
- `PRIVACY.md`：隐私与本地数据说明；
- `KNOWN_LIMITATIONS.md`：已知限制；
- `TEST_MATRIX.md`、`TEST_REPORT.md`：测试范围与本次发布验证记录；
- `LICENSE`、`THIRD_PARTY_NOTICES.md`：许可证与第三方组件说明；
- `RELEASE.json`：包内文件、版本与 EXE 校验信息。

## 从源码运行

需要 Node.js 22 与 npm：

```powershell
cd source
npm install
npm test
npm start
```

构建 Windows x64 便携版：

```powershell
npm run build:portable
```
