'use strict';

const MIN_TIMER_MINUTES = 1;
const MAX_TIMER_MINUTES = 480;
const CLOSE_BEHAVIORS = Object.freeze(['ask', 'tray', 'quit']);

function parseTimerMinutes(value) {
  if (typeof value === 'string' && value.trim() === '') return null;
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(number)) return null;
  if (number < MIN_TIMER_MINUTES || number > MAX_TIMER_MINUTES) return null;
  return number;
}

function normalizeCloseBehavior(value) {
  return CLOSE_BEHAVIORS.includes(value) ? value : 'ask';
}

function sanitizePreferences(value) {
  return {
    closeBehavior: normalizeCloseBehavior(value?.closeBehavior),
  };
}

function getRemainingSeconds(endsAt, now = Date.now()) {
  if (!Number.isFinite(endsAt)) return null;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

module.exports = {
  CLOSE_BEHAVIORS,
  MAX_TIMER_MINUTES,
  MIN_TIMER_MINUTES,
  getRemainingSeconds,
  normalizeCloseBehavior,
  parseTimerMinutes,
  sanitizePreferences,
};
