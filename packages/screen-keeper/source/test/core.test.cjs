'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  getRemainingSeconds,
  normalizeCloseBehavior,
  parseTimerMinutes,
  sanitizePreferences,
} = require('../lib/core.cjs');

test('定时分钟接受范围内整数', () => {
  assert.equal(parseTimerMinutes(1), 1);
  assert.equal(parseTimerMinutes('30'), 30);
  assert.equal(parseTimerMinutes(480), 480);
});

test('定时分钟拒绝越界和非整数', () => {
  for (const value of ['', 0, 481, 1.5, 'abc', Infinity, null, undefined]) {
    assert.equal(parseTimerMinutes(value), null);
  }
});

test('关闭窗口设置仅接受三种受控值', () => {
  assert.equal(normalizeCloseBehavior('ask'), 'ask');
  assert.equal(normalizeCloseBehavior('tray'), 'tray');
  assert.equal(normalizeCloseBehavior('quit'), 'quit');
  assert.equal(normalizeCloseBehavior('other'), 'ask');
});

test('非法本地设置会回退为每次询问', () => {
  assert.deepEqual(sanitizePreferences(null), { closeBehavior: 'ask' });
  assert.deepEqual(sanitizePreferences({ closeBehavior: 'tray' }), { closeBehavior: 'tray' });
  assert.deepEqual(sanitizePreferences({ closeBehavior: 'bad' }), { closeBehavior: 'ask' });
});

test('剩余秒数向上取整且不为负数', () => {
  assert.equal(getRemainingSeconds(61_001, 1_000), 61);
  assert.equal(getRemainingSeconds(500, 1_000), 0);
  assert.equal(getRemainingSeconds(null, 1_000), null);
});
