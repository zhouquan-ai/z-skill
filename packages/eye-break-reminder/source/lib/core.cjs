'use strict';

const LIMITS = Object.freeze({
  intervalMinutes: Object.freeze({ min: 1, max: 1440, fallback: 40 }),
  breakSeconds: Object.freeze({ min: 1, max: 3600, fallback: 60 })
});

function parsePositiveInteger(value, limits) {
  const normalized = typeof value === 'string' ? value.trim() : value;
  if (!/^\d+$/.test(String(normalized))) {
    return { ok: false, reason: '请输入整数' };
  }

  const number = Number(normalized);
  if (!Number.isSafeInteger(number) || number < limits.min || number > limits.max) {
    return { ok: false, reason: `请输入 ${limits.min}–${limits.max} 之间的整数` };
  }

  return { ok: true, value: number };
}

function validateSettings(candidate) {
  const interval = parsePositiveInteger(candidate.intervalMinutes, LIMITS.intervalMinutes);
  const breakDuration = parsePositiveInteger(candidate.breakSeconds, LIMITS.breakSeconds);
  const errors = {};

  if (!interval.ok) errors.intervalMinutes = interval.reason;
  if (!breakDuration.ok) errors.breakSeconds = breakDuration.reason;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      intervalMinutes: interval.value,
      breakSeconds: breakDuration.value
    }
  };
}

function sanitizeStoredSettings(candidate = {}) {
  const validation = validateSettings(candidate);
  if (validation.ok) return validation.value;
  return {
    intervalMinutes: LIMITS.intervalMinutes.fallback,
    breakSeconds: LIMITS.breakSeconds.fallback
  };
}

function sanitizeClosePreference(value) {
  return value === 'tray' || value === 'quit' ? value : null;
}

function remainingSeconds(deadline, now = Date.now()) {
  if (!Number.isFinite(deadline)) return 0;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function choosePopupPosition(workArea, popupSize, previous, random = Math.random) {
  const margin = 24;
  const minX = workArea.x + margin;
  const minY = workArea.y + margin;
  const maxX = Math.max(minX, workArea.x + workArea.width - popupSize.width - margin);
  const maxY = Math.max(minY, workArea.y + workArea.height - popupSize.height - margin);
  const candidates = [];

  for (let index = 0; index < 12; index += 1) {
    candidates.push({
      x: Math.round(minX + random() * (maxX - minX)),
      y: Math.round(minY + random() * (maxY - minY))
    });
  }

  if (!previous) return candidates[0];
  return candidates.reduce((best, candidate) => {
    const distance = Math.hypot(candidate.x - previous.x, candidate.y - previous.y);
    return distance > best.distance ? { ...candidate, distance } : best;
  }, { ...candidates[0], distance: Math.hypot(candidates[0].x - previous.x, candidates[0].y - previous.y) });
}

module.exports = {
  LIMITS,
  choosePopupPosition,
  formatClock,
  parsePositiveInteger,
  remainingSeconds,
  sanitizeClosePreference,
  sanitizeStoredSettings,
  validateSettings
};
