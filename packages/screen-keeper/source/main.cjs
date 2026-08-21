'use strict';

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  powerSaveBlocker,
  Tray,
} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const {
  CLOSE_BEHAVIORS,
  getRemainingSeconds,
  parseTimerMinutes,
  sanitizePreferences,
} = require('./lib/core.cjs');

const appRoot = __dirname;
const indexPath = path.join(appRoot, 'src', 'index.html');
const rendererUrl = pathToFileURL(indexPath).href;
const iconPath = path.join(appRoot, 'assets', 'icon.ico');

let mainWindow = null;
let tray = null;
let blockerId = null;
let timerId = null;
let endsAt = null;
let preferences = { closeBehavior: 'ask' };
let isQuitting = false;

function preferencesPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadPreferences() {
  try {
    preferences = sanitizePreferences(JSON.parse(fs.readFileSync(preferencesPath(), 'utf8')));
  } catch {
    preferences = { closeBehavior: 'ask' };
  }
}

function savePreferences() {
  const filePath = preferencesPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(preferences, null, 2)}\n`, 'utf8');
}

function isBlockerActive() {
  return Number.isInteger(blockerId) && powerSaveBlocker.isStarted(blockerId);
}

function clearTimer() {
  if (timerId !== null) clearTimeout(timerId);
  timerId = null;
  endsAt = null;
}

function publicState() {
  const active = isBlockerActive();
  if (!active && blockerId !== null) {
    blockerId = null;
    clearTimer();
  }
  return {
    isActive: active,
    endsAt,
    remainingSeconds: active ? getRemainingSeconds(endsAt) : null,
  };
}

function sendToRenderer(channel, value) {
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send(channel, value);
    return true;
  }
  return false;
}

function broadcastState() {
  const state = publicState();
  sendToRenderer('keeper:state-changed', state);
  rebuildTrayMenu(state);
  return state;
}

function scheduleTimer(minutes) {
  clearTimer();
  if (minutes === null) return;
  endsAt = Date.now() + minutes * 60 * 1000;
  timerId = setTimeout(() => stopKeepAwake(), minutes * 60 * 1000);
}

function startKeepAwake(rawMinutes = null) {
  let minutes = null;
  if (rawMinutes !== null && rawMinutes !== undefined) {
    minutes = parseTimerMinutes(rawMinutes);
    if (minutes === null) throw new TypeError('定时时间必须是 1至480 分钟的整数');
  }

  if (!isBlockerActive()) blockerId = powerSaveBlocker.start('prevent-display-sleep');
  scheduleTimer(minutes);
  return broadcastState();
}

function stopKeepAwake() {
  clearTimer();
  if (isBlockerActive()) powerSaveBlocker.stop(blockerId);
  blockerId = null;
  return broadcastState();
}

function setTimer(rawMinutes) {
  if (!isBlockerActive()) throw new Error('屏幕常亮尚未开启');
  const minutes = parseTimerMinutes(rawMinutes);
  if (minutes === null) throw new TypeError('定时时间必须是 1至480 分钟的整数');
  scheduleTimer(minutes);
  return broadcastState();
}

function cancelTimer() {
  if (!isBlockerActive()) return publicState();
  clearTimer();
  return broadcastState();
}

function cleanupRuntime() {
  clearTimer();
  if (isBlockerActive()) powerSaveBlocker.stop(blockerId);
  blockerId = null;
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function hideToTray() {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
}

function quitApplication() {
  isQuitting = true;
  cleanupRuntime();
  app.quit();
}

function performCloseAction(action) {
  if (action === 'tray') return hideToTray();
  if (action === 'quit') quitApplication();
}

async function showNativeCloseFallback() {
  const options = {
    type: 'question',
    title: '关闭窗口',
    message: '关闭窗口',
    buttons: ['退出应用', '最小化到托盘'],
    defaultId: 1,
    checkboxLabel: '记住我的选择',
    checkboxChecked: false,
    noLink: true,
  };
  const result = mainWindow
    ? await dialog.showMessageBox(mainWindow, options)
    : await dialog.showMessageBox(options);
  const action = result.response === 0 ? 'quit' : 'tray';
  if (result.checkboxChecked) {
    preferences.closeBehavior = action;
    savePreferences();
  }
  performCloseAction(action);
}

function requestClose() {
  if (preferences.closeBehavior === 'tray') return hideToTray();
  if (preferences.closeBehavior === 'quit') return quitApplication();
  if (!sendToRenderer('window:close-requested', null)) void showNativeCloseFallback();
}

function rebuildTrayMenu(state = publicState()) {
  if (!tray) return;
  tray.setToolTip(`屏幕常亮：${state.isActive ? '已开启' : '已停止'}`);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '打开主界面', click: showMainWindow },
    {
      label: state.isActive ? '停止常亮' : '开启常亮',
      click: () => (state.isActive ? stopKeepAwake() : startKeepAwake()),
    },
    { type: 'separator' },
    {
      label: '关闭窗口时',
      submenu: [
        { label: '每次询问', type: 'radio', checked: preferences.closeBehavior === 'ask', click: () => setCloseBehavior('ask') },
        { label: '最小化到托盘', type: 'radio', checked: preferences.closeBehavior === 'tray', click: () => setCloseBehavior('tray') },
        { label: '退出应用', type: 'radio', checked: preferences.closeBehavior === 'quit', click: () => setCloseBehavior('quit') },
      ],
    },
    { type: 'separator' },
    { label: '退出应用', click: quitApplication },
  ]));
}

function setCloseBehavior(value) {
  if (!CLOSE_BEHAVIORS.includes(value)) throw new TypeError('关闭窗口设置无效');
  preferences.closeBehavior = value;
  savePreferences();
  rebuildTrayMenu();
}

function createTray() {
  const image = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
  tray = new Tray(image);
  tray.on('double-click', showMainWindow);
  tray.on('click', showMainWindow);
  rebuildTrayMenu();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 370,
    height: 430,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    title: '屏幕常亮',
    icon: iconPath,
    autoHideMenuBar: true,
    backgroundColor: '#f5f5f7',
    webPreferences: {
      preload: path.join(appRoot, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.loadFile(indexPath);
  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== rendererUrl) event.preventDefault();
  });
  mainWindow.on('close', (event) => {
    if (isQuitting) return;
    event.preventDefault();
    requestClose();
  });
  mainWindow.on('query-session-end', () => {
    isQuitting = true;
    cleanupRuntime();
  });
}

function validateSender(event) {
  const url = event.senderFrame?.url?.split('#')[0];
  if (url !== rendererUrl) throw new Error('已拒绝未授权的界面请求');
}

function registerHandle(channel, handler) {
  ipcMain.handle(channel, (event, ...args) => {
    validateSender(event);
    return handler(...args);
  });
}

function registerIpc() {
  registerHandle('keeper:get-state', publicState);
  registerHandle('keeper:start', startKeepAwake);
  registerHandle('keeper:stop', stopKeepAwake);
  registerHandle('keeper:set-timer', setTimer);
  registerHandle('keeper:cancel-timer', cancelTimer);
  registerHandle('window:resolve-close', ({ action, remember } = {}) => {
    if (!['tray', 'quit'].includes(action)) throw new TypeError('关闭窗口操作无效');
    if (remember === true) {
      preferences.closeBehavior = action;
      savePreferences();
    }
    performCloseAction(action);
    return { ok: true };
  });
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', showMainWindow);
  app.on('before-quit', () => {
    isQuitting = true;
    cleanupRuntime();
  });
  app.on('activate', showMainWindow);
  app.whenReady().then(() => {
    loadPreferences();
    registerIpc();
    createTray();
    createWindow();
  });
}
