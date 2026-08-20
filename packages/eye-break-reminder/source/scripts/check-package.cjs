'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const required = [
  'README.md',
  'PRIVACY.md',
  'KNOWN_LIMITATIONS.md',
  'THIRD_PARTY_NOTICES.md',
  'LICENSE',
  'assets/icon.svg',
  'assets/icon.ico',
  'main.cjs',
  'preload.cjs',
  'src/index.html',
  'src/reminder.html'
];

const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)));
if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`Package check passed (${required.length} required files).`);
}

const mainMarkup = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');
const reminderMarkup = fs.readFileSync(path.join(root, 'src', 'reminder.html'), 'utf8');
const removedUiFragments = ['EYE BREAK', 'button-icon', 'privacy-note', 'horizon-mark'];
const remainingFragments = removedUiFragments.filter((fragment) => mainMarkup.includes(fragment) || reminderMarkup.includes(fragment));
if (remainingFragments.length > 0) {
  console.error(`Removed UI fragments still present: ${remainingFragments.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('Compact UI content check passed.');
}

const requiredCloseFlowFragments = [
  'close-dialog-layer',
  '记住我的选择',
  '最小化到托盘',
  '退出应用'
];
const missingCloseFlowFragments = requiredCloseFlowFragments.filter((fragment) => !mainMarkup.includes(fragment));
if (missingCloseFlowFragments.length > 0) {
  console.error(`Close flow UI fragments missing: ${missingCloseFlowFragments.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('Close flow UI content check passed.');
}
