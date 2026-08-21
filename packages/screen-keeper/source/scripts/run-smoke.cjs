'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const electronPath = require('electron');
const temporaryUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'screen-keeper-smoke-'));

try {
  const result = spawnSync(electronPath, [path.join(__dirname, 'smoke-app.cjs')], {
    env: { ...process.env, SCREEN_KEEPER_SMOKE_USER_DATA: temporaryUserData },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(temporaryUserData, { recursive: true, force: true });
}
