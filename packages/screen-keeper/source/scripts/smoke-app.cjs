'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

const temporaryUserData = process.env.SCREEN_KEEPER_SMOKE_USER_DATA;
if (!temporaryUserData) throw new Error('缺少冒烟测试临时目录');
app.disableHardwareAcceleration();
app.setPath('userData', temporaryUserData);
app.setName('屏幕常亮测试');

require('../main.cjs');

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitFor(check, timeout = 5000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const result = await check();
    if (result) return result;
    await delay(50);
  }
  throw new Error('冒烟测试等待超时');
}

app.whenReady().then(async () => {
  const window = await waitFor(() => BrowserWindow.getAllWindows()[0]);
  await waitFor(() => !window.webContents.isLoading());

  await window.webContents.executeJavaScript(`document.querySelector('#toggleButton').click()`);
  await waitFor(async () => (await window.webContents.executeJavaScript(`document.querySelector('#statusText').textContent`)) === '常亮中');

  await window.webContents.executeJavaScript(`document.querySelector('#toggleButton').click()`);
  await waitFor(async () => (await window.webContents.executeJavaScript(`document.querySelector('#statusText').textContent`)) === '已停止');

  window.close();
  await waitFor(() => window.webContents.executeJavaScript(`document.querySelector('#closeDialog').open`));
  await window.webContents.executeJavaScript(`
    document.querySelector('#rememberChoice').checked = true;
    document.querySelector('#trayButton').click();
  `);
  await waitFor(() => !window.isVisible());

  const settingsPath = path.join(temporaryUserData, 'settings.json');
  await waitFor(() => fs.existsSync(settingsPath));
  assert.equal(JSON.parse(fs.readFileSync(settingsPath, 'utf8')).closeBehavior, 'tray');

  window.show();
  window.close();
  await waitFor(() => !window.isVisible());
  assert.equal(await window.webContents.executeJavaScript(`document.querySelector('#closeDialog').open`), false);

  console.log('应用冒烟测试通过：启停、关闭询问、记住选择和托盘隐藏均正常。');
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
