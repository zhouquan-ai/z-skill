'use strict';

const elements = {
  status: document.querySelector('#status-pill'),
  label: document.querySelector('#countdown-label'),
  countdown: document.querySelector('#countdown'),
  notice: document.querySelector('#notice'),
  settings: document.querySelector('#settings-card'),
  intervalInput: document.querySelector('#interval-input'),
  breakInput: document.querySelector('#break-input'),
  intervalError: document.querySelector('#interval-error'),
  breakError: document.querySelector('#break-error'),
  toggle: document.querySelector('#toggle-button'),
  closeDialogLayer: document.querySelector('#close-dialog-layer'),
  rememberCloseChoice: document.querySelector('#remember-close-choice'),
  minimizeToTray: document.querySelector('#minimize-to-tray-button'),
  quitApp: document.querySelector('#quit-app-button')
};

let state;
let togglePending = false;
let closeChoicePending = false;
const stepButtons = [...document.querySelectorAll('.step-button')];

function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

function setSettingsLocked(locked) {
  elements.settings.classList.toggle('is-locked', locked);
  elements.settings.setAttribute('aria-disabled', String(locked));
  if (locked) elements.settings.setAttribute('title', '暂停提醒后可修改');
  else elements.settings.removeAttribute('title');
  elements.intervalInput.disabled = locked;
  elements.breakInput.disabled = locked;
  stepButtons.forEach((button) => {
    button.disabled = locked;
  });
}

function render(nextState, preserveInputs = false) {
  state = nextState;
  const isRunning = state.running;
  elements.status.className = `status-label ${isRunning ? 'is-running' : 'is-paused'}`;
  elements.status.textContent = isRunning ? '运行中' : '已暂停';
  elements.label.textContent = state.phase === 'break' ? '正在放松' : '下一次提醒';
  elements.countdown.textContent = formatClock(isRunning ? state.remainingSeconds : state.settings.intervalMinutes * 60);
  elements.notice.textContent = state.notice || '';
  elements.notice.classList.toggle('is-visible', Boolean(state.notice));
  setSettingsLocked(isRunning);

  elements.toggle.classList.toggle('is-running', isRunning);
  elements.toggle.innerHTML = isRunning
    ? '<span>暂停提醒</span>'
    : '<span>开始提醒</span>';

  if (!preserveInputs) {
    elements.intervalInput.value = state.settings.intervalMinutes;
    elements.breakInput.value = state.settings.breakSeconds;
  }
}

function currentCandidate() {
  return {
    intervalMinutes: elements.intervalInput.value,
    breakSeconds: elements.breakInput.value
  };
}

function clearErrors() {
  elements.intervalError.textContent = '';
  elements.breakError.textContent = '';
  elements.intervalInput.removeAttribute('aria-invalid');
  elements.breakInput.removeAttribute('aria-invalid');
}

async function applySettings() {
  if (state?.running) return false;
  const result = await window.eyeBreak.updateSettings(currentCandidate());
  clearErrors();
  if (result.locked) {
    render(await window.eyeBreak.getState());
    return false;
  }
  if (!result.ok) {
    if (result.errors?.intervalMinutes) {
      elements.intervalError.textContent = result.errors.intervalMinutes;
      elements.intervalInput.setAttribute('aria-invalid', 'true');
    }
    if (result.errors?.breakSeconds) {
      elements.breakError.textContent = result.errors.breakSeconds;
      elements.breakInput.setAttribute('aria-invalid', 'true');
    }
    return false;
  }
  elements.intervalInput.value = result.value.intervalMinutes;
  elements.breakInput.value = result.value.breakSeconds;
  return true;
}

function inputForField(field) {
  return field === 'intervalMinutes' ? elements.intervalInput : elements.breakInput;
}

stepButtons.forEach((button) => {
  let repeatTimer;
  let repeatDelay;

  const step = async () => {
    if (state.running) return;
    const field = button.dataset.field;
    const input = inputForField(field);
    const limits = field === 'intervalMinutes' ? { min: 1, max: 1440 } : { min: 1, max: 3600 };
    const fallback = state.settings[field];
    const numeric = /^\d+$/.test(input.value.trim()) ? Number(input.value) : fallback;
    input.value = Math.min(limits.max, Math.max(limits.min, numeric + Number(button.dataset.delta)));
    await applySettings();
  };

  button.addEventListener('click', step);
  button.addEventListener('pointerdown', () => {
    repeatDelay = window.setTimeout(() => {
      repeatTimer = window.setInterval(step, 120);
    }, 450);
  });
  const stopRepeat = () => {
    window.clearTimeout(repeatDelay);
    window.clearInterval(repeatTimer);
  };
  button.addEventListener('pointerup', stopRepeat);
  button.addEventListener('pointercancel', stopRepeat);
  button.addEventListener('pointerleave', stopRepeat);
});

[elements.intervalInput, elements.breakInput].forEach((input) => {
  input.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (await applySettings()) input.blur();
    }
  });
  input.addEventListener('blur', applySettings);
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    const error = input === elements.intervalInput ? elements.intervalError : elements.breakError;
    error.textContent = '';
  });
});

elements.toggle.addEventListener('click', async () => {
  if (togglePending) return;
  togglePending = true;
  elements.toggle.disabled = true;
  try {
    if (!state.running && !(await applySettings())) return;
    render(await window.eyeBreak.toggleRunning());
  } finally {
    togglePending = false;
    elements.toggle.disabled = false;
  }
});

function showCloseDialog() {
  closeChoicePending = false;
  elements.rememberCloseChoice.checked = false;
  elements.closeDialogLayer.hidden = false;
  document.body.classList.add('has-dialog');
  window.requestAnimationFrame(() => {
    elements.closeDialogLayer.classList.add('is-visible');
    elements.minimizeToTray.focus();
  });
}

function hideCloseDialog() {
  elements.closeDialogLayer.classList.remove('is-visible');
  elements.closeDialogLayer.hidden = true;
  document.body.classList.remove('has-dialog');
  closeChoicePending = false;
}

async function resolveCloseChoice(choice) {
  if (closeChoicePending) return;
  closeChoicePending = true;
  elements.minimizeToTray.disabled = true;
  elements.quitApp.disabled = true;
  try {
    const result = await window.eyeBreak.resolveCloseChoice(choice, elements.rememberCloseChoice.checked);
    if (result.ok) hideCloseDialog();
  } finally {
    elements.minimizeToTray.disabled = false;
    elements.quitApp.disabled = false;
    closeChoicePending = false;
  }
}

elements.minimizeToTray.addEventListener('click', () => resolveCloseChoice('tray'));
elements.quitApp.addEventListener('click', () => resolveCloseChoice('quit'));
document.addEventListener('keydown', async (event) => {
  if (event.key !== 'Escape' || elements.closeDialogLayer.hidden || closeChoicePending) return;
  event.preventDefault();
  await window.eyeBreak.cancelCloseChoice();
  hideCloseDialog();
});

window.eyeBreak.onStateUpdated((nextState) => {
  const focused = document.activeElement === elements.intervalInput || document.activeElement === elements.breakInput;
  render(nextState, focused);
});

window.eyeBreak.onCloseChoiceRequested(showCloseDialog);

window.eyeBreak.getState().then(render);
