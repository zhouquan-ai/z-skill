'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs', 'screenshots');
let state = { isActive: false, endsAt: null, remainingSeconds: null };

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function capture(window, name) {
  await delay(220);
  const image = await window.webContents.capturePage();
  fs.writeFileSync(path.join(output, name), image.toPNG());
}

function registerHandlers() {
  ipcMain.handle('keeper:get-state', () => state);
  ipcMain.handle('keeper:start', (_event, minutes) => {
    state = {
      isActive: true,
      endsAt: minutes ? Date.now() + minutes * 60 * 1000 : null,
      remainingSeconds: minutes ? minutes * 60 : null,
    };
    return state;
  });
  ipcMain.handle('keeper:stop', () => {
    state = { isActive: false, endsAt: null, remainingSeconds: null };
    return state;
  });
  ipcMain.handle('keeper:set-timer', (_event, minutes) => {
    state = { isActive: true, endsAt: Date.now() + minutes * 60 * 1000, remainingSeconds: minutes * 60 };
    return state;
  });
  ipcMain.handle('keeper:cancel-timer', () => {
    state = { ...state, endsAt: null, remainingSeconds: null };
    return state;
  });
  ipcMain.handle('window:resolve-close', () => ({ ok: true }));
}

app.whenReady().then(async () => {
  fs.mkdirSync(output, { recursive: true });
  registerHandlers();
  const window = new BrowserWindow({
    width: 370,
    height: 430,
    useContentSize: true,
    show: false,
    backgroundColor: '#f5f5f7',
    webPreferences: {
      preload: path.join(root, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  await window.loadFile(path.join(root, 'src', 'index.html'));
  const layout = await window.webContents.executeJavaScript(`(() => {
    const card = document.querySelector('.app-card').getBoundingClientRect();
    return {
      top: card.top,
      left: card.left,
      right: innerWidth - card.right,
      bottom: innerHeight - card.bottom,
      settingsEntryExists: Boolean(document.querySelector('#settingsButton, #settingsDialog'))
    };
  })()`);
  if (layout.settingsEntryExists || [layout.top, layout.left, layout.right, layout.bottom].some((value) => Math.abs(value - 18) > 0.5)) {
    throw new Error(`主界面留白验收失败：${JSON.stringify(layout)}`);
  }
  await capture(window, '01-main-stopped.png');

  await window.webContents.executeJavaScript(`document.querySelector('[data-minutes="30"]').click()`);
  await window.webContents.executeJavaScript(`document.querySelector('#toggleButton').click()`);
  await delay(100);
  await capture(window, '02-main-running.png');

  await window.webContents.executeJavaScript(`document.querySelector('#cancelTimerButton').click()`);
  await delay(100);
  const cancelledTimer = await window.webContents.executeJavaScript(`({
    summary: document.querySelector('#timerSummary').textContent,
    cancelHidden: document.querySelector('#cancelTimerButton').hidden
  })`);
  if (cancelledTimer.summary !== '未设置定时' || !cancelledTimer.cancelHidden) {
    throw new Error(`取消定时验收失败：${JSON.stringify(cancelledTimer)}`);
  }
  await window.webContents.executeJavaScript(`document.querySelector('[data-minutes="30"]').click()`);

  await window.webContents.executeJavaScript(`
    document.querySelector('#customMinutes').value = '0';
    document.querySelector('#setCustomTimer').click();
  `);
  await capture(window, '03-main-validation.png');

  await window.webContents.executeJavaScript(`
    document.querySelector('#customMinutes').value = '30';
    document.querySelector('#setCustomTimer').click();
  `);

  window.webContents.send('window:close-requested');
  await delay(100);
  const closeUi = await window.webContents.executeJavaScript(`({
    open: document.querySelector('#closeDialog').open,
    title: document.querySelector('#closeTitle').textContent,
    safeChoice: document.querySelector('#trayButton').textContent,
    quitChoice: document.querySelector('#quitButton').textContent,
    defaultFocus: document.activeElement?.id,
    hasExtraDescription: Boolean(document.querySelector('#closeDialog p'))
  })`);
  if (!closeUi.open || closeUi.title !== '关闭窗口' || closeUi.safeChoice !== '最小化到托盘'
    || closeUi.quitChoice !== '退出应用' || closeUi.defaultFocus !== 'trayButton'
    || closeUi.hasExtraDescription) {
    throw new Error(`关闭窗口验收失败：${JSON.stringify(closeUi)}`);
  }
  await capture(window, '04-close-choice.png');

  window.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
