'use strict';

const { app, BrowserWindow, ipcMain, Menu, powerMonitor, screen, session, Tray } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const {
  choosePopupPosition,
  remainingSeconds,
  sanitizeClosePreference,
  sanitizeStoredSettings,
  validateSettings
} = require('./lib/core.cjs');

const MAIN_SIZE = Object.freeze({ width: 400, height: 420 });
const POPUP_SIZE = Object.freeze({ width: 260, height: 156 });

let mainWindow;
let reminderWindow;
let tray;
let timer;
let previousPopupPosition;
let reminderCloseTimer;
let reminderClosing = false;
const awayState = { suspended: false, locked: false };
let settingsPath;
let storedWindowBounds;
let closePreference = null;
let closeDialogOpen = false;
let isQuitting = false;
let settings = sanitizeStoredSettings();
let runtime = {
  running: false,
  phase: 'paused',
  deadline: null,
  activeBreakSeconds: null,
  notice: ''
};

function readStorage() {
  settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    settings = sanitizeStoredSettings(parsed.settings);
    storedWindowBounds = parsed.windowBounds;
    closePreference = sanitizeClosePreference(parsed.closePreference);
  } catch {
    settings = sanitizeStoredSettings();
    closePreference = null;
  }
}

function writeStorage() {
  const payload = JSON.stringify({ settings, windowBounds: storedWindowBounds, closePreference }, null, 2);
  const temporaryPath = `${settingsPath}.tmp`;
  fs.writeFileSync(temporaryPath, payload, 'utf8');
  fs.renameSync(temporaryPath, settingsPath);
}

function isVisibleOnAnyDisplay(bounds) {
  if (!bounds || !Number.isFinite(bounds.x) || !Number.isFinite(bounds.y)) return false;
  return screen.getAllDisplays().some(({ workArea }) => {
    const horizontalOverlap = Math.min(bounds.x + MAIN_SIZE.width, workArea.x + workArea.width) - Math.max(bounds.x, workArea.x);
    const verticalOverlap = Math.min(bounds.y + MAIN_SIZE.height, workArea.y + workArea.height) - Math.max(bounds.y, workArea.y);
    return horizontalOverlap >= 120 && verticalOverlap >= 80;
  });
}

function publicState() {
  return {
    settings,
    running: runtime.running,
    phase: runtime.phase,
    remainingSeconds: remainingSeconds(runtime.deadline),
    activeBreakSeconds: runtime.activeBreakSeconds,
    notice: runtime.notice
  };
}

function broadcastState() {
  const state = publicState();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('state-updated', state);
  if (reminderWindow && !reminderWindow.isDestroyed()) reminderWindow.webContents.send('state-updated', state);
  if (tray && !tray.isDestroyed()) tray.setToolTip(`护眼提醒 · ${runtime.running ? '运行中' : '已暂停'}`);
}

function rememberMainWindowBounds() {
  if (mainWindow && !mainWindow.isDestroyed()) storedWindowBounds = mainWindow.getBounds();
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function updateTrayMenu() {
  if (!tray || tray.isDestroyed()) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '显示主窗口', click: showMainWindow },
    { type: 'separator' },
    {
      label: '恢复关闭时询问',
      enabled: Boolean(closePreference),
      click: () => {
        closePreference = null;
        writeStorage();
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    { label: '退出应用', click: requestAppQuit }
  ]));
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'icon.ico'));
  tray.setToolTip('护眼提醒 · 已暂停');
  tray.on('double-click', showMainWindow);
  updateTrayMenu();
}

function hideToTray() {
  closeDialogOpen = false;
  rememberMainWindowBounds();
  writeStorage();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
}

function requestAppQuit() {
  closeDialogOpen = false;
  isQuitting = true;
  rememberMainWindowBounds();
  writeStorage();
  app.quit();
}

function clearNoticeSoon() {
  setTimeout(() => {
    if (runtime.notice) {
      runtime.notice = '';
      broadcastState();
    }
  }, 1800);
}

function beginCountdown(notice = '') {
  runtime.running = true;
  runtime.phase = 'countdown';
  runtime.deadline = Date.now() + settings.intervalMinutes * 60 * 1000;
  runtime.activeBreakSeconds = null;
  runtime.notice = notice;
  broadcastState();
  if (notice) clearNoticeSoon();
}

function closeReminderImmediately() {
  if (reminderCloseTimer) clearTimeout(reminderCloseTimer);
  reminderCloseTimer = undefined;
  reminderClosing = false;
  if (reminderWindow && !reminderWindow.isDestroyed()) reminderWindow.close();
  reminderWindow = undefined;
}

function finishBreakNow() {
  closeReminderImmediately();
  if (runtime.running) beginCountdown();
}

function requestBreakCompletion() {
  if (reminderClosing) return;
  reminderClosing = true;

  if (reminderWindow && !reminderWindow.isDestroyed()) {
    reminderWindow.webContents.send('dismiss-reminder');
    reminderCloseTimer = setTimeout(finishBreakNow, 160);
  } else {
    finishBreakNow();
  }
}

function showReminder() {
  if (!runtime.running || reminderWindow) return;

  runtime.phase = 'break';
  reminderClosing = false;
  runtime.activeBreakSeconds = settings.breakSeconds;
  runtime.deadline = Date.now() + runtime.activeBreakSeconds * 1000;

  const point = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(point);
  const position = choosePopupPosition(display.workArea, POPUP_SIZE, previousPopupPosition);
  previousPopupPosition = position;

  reminderWindow = new BrowserWindow({
    ...POPUP_SIZE,
    ...position,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false
    }
  });

  reminderWindow.setAlwaysOnTop(true, 'floating');
  reminderWindow.loadFile(path.join(__dirname, 'src', 'reminder.html'));
  reminderWindow.once('ready-to-show', () => {
    reminderWindow.show();
    broadcastState();
  });
  reminderWindow.on('closed', () => {
    reminderWindow = undefined;
  });
}

function tick() {
  if (!runtime.running || !runtime.deadline) return;
  if (remainingSeconds(runtime.deadline) === 0) {
    if (runtime.phase === 'countdown') showReminder();
    else if (runtime.phase === 'break') requestBreakCompletion();
  }
  broadcastState();
}

function markUserAway(reason) {
  awayState[reason] = true;
  if (!runtime.running || runtime.phase === 'away') return;

  closeReminderImmediately();
  runtime.phase = 'away';
  runtime.deadline = null;
  runtime.activeBreakSeconds = null;
  runtime.notice = '';
  broadcastState();
}

function markUserReturned(reason) {
  awayState[reason] = false;
  if (runtime.running && runtime.phase === 'away' && !awayState.suspended && !awayState.locked) {
    beginCountdown();
  }
}

function registerPowerEvents() {
  powerMonitor.on('suspend', () => markUserAway('suspended'));
  powerMonitor.on('resume', () => markUserReturned('suspended'));
  powerMonitor.on('lock-screen', () => markUserAway('locked'));
  powerMonitor.on('unlock-screen', () => markUserReturned('locked'));
}

function createMainWindow() {
  const remembered = isVisibleOnAnyDisplay(storedWindowBounds)
    ? { x: storedWindowBounds.x, y: storedWindowBounds.y }
    : {};
  mainWindow = new BrowserWindow({
    ...MAIN_SIZE,
    ...remembered,
    minWidth: 380,
    minHeight: 400,
    show: false,
    backgroundColor: '#f4f7fb',
    title: '护眼提醒',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    broadcastState();
  });
  mainWindow.on('close', (event) => {
    rememberMainWindowBounds();
    if (isQuitting) return;

    event.preventDefault();
    if (closePreference === 'tray') {
      hideToTray();
      return;
    }
    if (closePreference === 'quit') {
      requestAppQuit();
      return;
    }
    closeDialogOpen = true;
    mainWindow.webContents.send('close-choice-requested');
  });
  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

function registerIpc() {
  ipcMain.handle('get-state', () => publicState());

  ipcMain.handle('update-settings', (_event, candidate) => {
    if (runtime.running) return { ok: false, locked: true, value: settings };

    const validation = validateSettings(candidate || {});
    if (!validation.ok) return validation;

    settings = validation.value;
    writeStorage();
    broadcastState();
    return { ok: true, value: settings };
  });

  ipcMain.handle('toggle-running', () => {
    if (runtime.running) {
      runtime = {
        running: false,
        phase: 'paused',
        deadline: null,
        activeBreakSeconds: null,
        notice: ''
      };
      closeReminderImmediately();
      broadcastState();
    } else {
      beginCountdown();
    }
    return publicState();
  });

  ipcMain.handle('complete-break', () => {
    if (runtime.phase === 'break') requestBreakCompletion();
    return publicState();
  });

  ipcMain.handle('resolve-close-choice', (event, payload = {}) => {
    if (!mainWindow || event.sender !== mainWindow.webContents || !closeDialogOpen) return { ok: false };
    const choice = sanitizeClosePreference(payload.choice);
    if (!choice) return { ok: false };

    closeDialogOpen = false;
    if (payload.remember === true) {
      closePreference = choice;
      writeStorage();
      updateTrayMenu();
    }
    if (choice === 'tray') hideToTray();
    else requestAppQuit();
    return { ok: true };
  });

  ipcMain.handle('cancel-close-choice', (event) => {
    if (!mainWindow || event.sender !== mainWindow.webContents) return { ok: false };
    closeDialogOpen = false;
    return { ok: true };
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showMainWindow();
  });

  app.whenReady().then(() => {
    readStorage();
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    app.on('web-contents-created', (_event, contents) => {
      contents.setWindowOpenHandler(() => ({ action: 'deny' }));
      contents.on('will-navigate', (event) => event.preventDefault());
    });
    registerIpc();
    registerPowerEvents();
    createTray();
    createMainWindow();
    timer = setInterval(tick, 250);
  });
}

app.on('activate', showMainWindow);
app.on('before-quit', () => {
  isQuitting = true;
  if (timer) clearInterval(timer);
});
