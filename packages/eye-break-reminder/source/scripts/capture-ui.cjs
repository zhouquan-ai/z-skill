'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { validateSettings } = require('../lib/core.cjs');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs', 'screenshots');
let state = {
  settings: { intervalMinutes: 40, breakSeconds: 60 },
  running: false,
  phase: 'paused',
  remainingSeconds: 2400,
  activeBreakSeconds: null,
  notice: ''
};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function capture(window, name) {
  await delay(180);
  const image = await window.webContents.capturePage();
  fs.writeFileSync(path.join(output, name), image.toPNG());
}

async function loadWindow(file, options) {
  const window = new BrowserWindow({
    show: false,
    backgroundColor: '#f3f6fa',
    webPreferences: {
      preload: path.join(root, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    ...options
  });
  await window.loadFile(path.join(root, 'src', file));
  return window;
}

app.whenReady().then(async () => {
  fs.mkdirSync(output, { recursive: true });
  ipcMain.handle('get-state', () => state);
  ipcMain.handle('update-settings', (_event, candidate) => {
    if (state.running) return { ok: false, locked: true, value: state.settings };
    const result = validateSettings(candidate);
    if (result.ok) state = { ...state, settings: result.value };
    return result;
  });
  ipcMain.handle('toggle-running', () => state);
  ipcMain.handle('complete-break', () => state);
  ipcMain.handle('resolve-close-choice', () => ({ ok: true }));
  ipcMain.handle('cancel-close-choice', () => ({ ok: true }));

  const main = await loadWindow('index.html', { width: 400, height: 420 });
  await capture(main, '01-main-paused.png');

  state = {
    ...state,
    running: true,
    phase: 'countdown',
    remainingSeconds: 2382,
    notice: ''
  };
  main.webContents.send('state-updated', state);
  await capture(main, '02-main-running.png');

  const runningUi = await main.webContents.executeJavaScript(`({
    statusText: document.querySelector('#status-pill').textContent,
    capsule: document.querySelector('#status-pill').classList.contains('is-running'),
    settingsLocked: document.querySelector('#settings-card').getAttribute('aria-disabled') === 'true',
    controlsDisabled: [...document.querySelectorAll('#settings-card input, #settings-card button')].every((control) => control.disabled)
  })`);
  if (runningUi.statusText !== '运行中' || !runningUi.capsule || !runningUi.settingsLocked || !runningUi.controlsDisabled) {
    throw new Error(`Running-state lock check failed: ${JSON.stringify(runningUi)}`);
  }
  const lockedUpdate = await main.webContents.executeJavaScript(`window.eyeBreak.updateSettings({ intervalMinutes: 5, breakSeconds: 5 })`);
  if (!lockedUpdate.locked || state.settings.intervalMinutes !== 40 || state.settings.breakSeconds !== 60) {
    throw new Error(`Locked settings update check failed: ${JSON.stringify(lockedUpdate)}`);
  }
  console.log('Running-state capsule and settings lock checks passed.');

  state = {
    ...state,
    running: false,
    phase: 'paused',
    remainingSeconds: 2400
  };
  main.webContents.send('state-updated', state);
  await delay(80);

  await main.webContents.executeJavaScript(`
    document.querySelector('#interval-input').value = '0';
    document.querySelector('#interval-input').dispatchEvent(new Event('blur'));
  `);
  await capture(main, '03-main-validation.png');

  main.webContents.send('close-choice-requested');
  await delay(220);
  const closeDialogUi = await main.webContents.executeJavaScript(`({
    visible: !document.querySelector('#close-dialog-layer').hidden,
    modal: document.querySelector('.close-dialog').getAttribute('aria-modal'),
    title: document.querySelector('#close-dialog-title').textContent,
    safeChoice: document.querySelector('#minimize-to-tray-button').textContent,
    quitChoice: document.querySelector('#quit-app-button').textContent,
    defaultFocus: document.activeElement?.id
  })`);
  if (!closeDialogUi.visible || closeDialogUi.modal !== 'true' || closeDialogUi.title !== '关闭窗口'
    || closeDialogUi.safeChoice !== '最小化到托盘' || closeDialogUi.quitChoice !== '退出应用'
    || closeDialogUi.defaultFocus !== 'minimize-to-tray-button') {
    throw new Error(`Close dialog check failed: ${JSON.stringify(closeDialogUi)}`);
  }
  await capture(main, '05-close-choice.png');
  await main.webContents.executeJavaScript(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await delay(80);
  const closeDialogDismissed = await main.webContents.executeJavaScript(`document.querySelector('#close-dialog-layer').hidden`);
  if (!closeDialogDismissed) throw new Error('Close dialog Escape dismissal check failed.');
  console.log('Close dialog choices, safe default focus and Escape dismissal checks passed.');

  main.webContents.send('close-choice-requested');
  await delay(220);
  await main.webContents.executeJavaScript(`document.querySelector('#minimize-to-tray-button').click()`);
  await delay(80);
  const resolvedCloseDialogUi = await main.webContents.executeJavaScript(`({
    hidden: document.querySelector('#close-dialog-layer').hidden,
    visibleClass: document.querySelector('#close-dialog-layer').classList.contains('is-visible'),
    bodyLocked: document.body.classList.contains('has-dialog')
  })`);
  if (!resolvedCloseDialogUi.hidden || resolvedCloseDialogUi.visibleClass || resolvedCloseDialogUi.bodyLocked) {
    throw new Error(`Resolved close dialog reset check failed: ${JSON.stringify(resolvedCloseDialogUi)}`);
  }
  console.log('Successful close choice resets the modal before the main window is restored.');

  state = {
    ...state,
    phase: 'break',
    remainingSeconds: 60,
    activeBreakSeconds: 60,
    notice: ''
  };
  const reminder = await loadWindow('reminder.html', {
    width: 260,
    height: 156,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000'
  });
  await capture(reminder, '04-reminder.png');
  reminder.webContents.send('dismiss-reminder');
  await delay(30);
  const exitState = await reminder.webContents.executeJavaScript(`({
    closing: document.querySelector('.reminder-card').classList.contains('is-closing'),
    animationName: getComputedStyle(document.querySelector('.reminder-card')).animationName
  })`);
  if (!exitState.closing || !['exit', 'fade-out'].includes(exitState.animationName)) {
    throw new Error(`Reminder exit animation check failed: ${JSON.stringify(exitState)}`);
  }
  console.log(`Reminder exit animation check passed (${exitState.animationName}).`);
  reminder.destroy();
  main.destroy();
  app.quit();
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
