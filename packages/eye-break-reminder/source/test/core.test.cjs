'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  LIMITS,
  choosePopupPosition,
  formatClock,
  parsePositiveInteger,
  remainingSeconds,
  sanitizeClosePreference,
  sanitizeStoredSettings,
  validateSettings
} = require('../lib/core.cjs');

test('default settings are 40 minutes and 60 seconds', () => {
  assert.deepEqual(sanitizeStoredSettings(), { intervalMinutes: 40, breakSeconds: 60 });
});

test('close preference only accepts tray or quit', () => {
  assert.equal(sanitizeClosePreference('tray'), 'tray');
  assert.equal(sanitizeClosePreference('quit'), 'quit');
  assert.equal(sanitizeClosePreference('ask'), null);
  assert.equal(sanitizeClosePreference(undefined), null);
});

test('positive integer parser accepts boundaries and rejects malformed input', () => {
  assert.deepEqual(parsePositiveInteger('1', LIMITS.intervalMinutes), { ok: true, value: 1 });
  assert.deepEqual(parsePositiveInteger('1440', LIMITS.intervalMinutes), { ok: true, value: 1440 });
  assert.equal(parsePositiveInteger('', LIMITS.intervalMinutes).ok, false);
  assert.equal(parsePositiveInteger('1.5', LIMITS.intervalMinutes).ok, false);
  assert.equal(parsePositiveInteger('abc', LIMITS.intervalMinutes).ok, false);
  assert.equal(parsePositiveInteger('1441', LIMITS.intervalMinutes).ok, false);
});

test('settings validation returns field-specific errors', () => {
  const result = validateSettings({ intervalMinutes: '0', breakSeconds: '3601' });
  assert.equal(result.ok, false);
  assert.match(result.errors.intervalMinutes, /1–1440/);
  assert.match(result.errors.breakSeconds, /1–3600/);
});

test('remaining time uses a deadline and rounds up', () => {
  assert.equal(remainingSeconds(10_001, 10_000), 1);
  assert.equal(remainingSeconds(10_999, 10_000), 1);
  assert.equal(remainingSeconds(11_001, 10_000), 2);
  assert.equal(remainingSeconds(9_000, 10_000), 0);
});

test('clock formatting remains stable above one hour', () => {
  assert.equal(formatClock(0), '00:00');
  assert.equal(formatClock(60), '01:00');
  assert.equal(formatClock(86_400), '1440:00');
});

test('popup position stays inside the display work area with margin', () => {
  const values = [0, 0, 1, 1, 0.25, 0.75, 0.6, 0.4, 0.8, 0.2, 0.1, 0.9, 0.3, 0.7, 0.45, 0.55, 0.65, 0.35, 0.05, 0.95, 0.15, 0.85, 0.5, 0.5];
  let index = 0;
  const position = choosePopupPosition(
    { x: 100, y: 50, width: 1200, height: 800 },
    { width: 260, height: 156 },
    { x: 124, y: 74 },
    () => values[index++ % values.length]
  );
  assert.ok(position.x >= 124 && position.x <= 1016);
  assert.ok(position.y >= 74 && position.y <= 670);
  assert.ok(Math.hypot(position.x - 124, position.y - 74) > 300);
});
