'use strict';

const api = window.screenKeeper;

const statusCard = document.getElementById('statusCard');
const statusText = document.getElementById('statusText');
const timerSummary = document.getElementById('timerSummary');
const timerFooter = document.getElementById('timerFooter');
const cancelTimerButton = document.getElementById('cancelTimerButton');
const toggleButton = document.getElementById('toggleButton');
const presetButtons = [...document.querySelectorAll('.preset-button')];
const customMinutes = document.getElementById('customMinutes');
const setCustomTimer = document.getElementById('setCustomTimer');
const timerError = document.getElementById('timerError');
const closeDialog = document.getElementById('closeDialog');
const rememberChoice = document.getElementById('rememberChoice');
const quitButton = document.getElementById('quitButton');
const trayButton = document.getElementById('trayButton');

let currentState = { isActive: false, endsAt: null, remainingSeconds: null };
let selectedMinutes = null;
let isBusy = false;

function parseMinutes(value) {
  if (typeof value === 'string' && value.trim() === '') return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 480 ? number : null;
}

function formatRemaining(seconds) {
  if (!Number.isFinite(seconds)) return '未设置定时';
  const total = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')} 后停止`;
  return `${minutes}:${String(remainder).padStart(2, '0')} 后停止`;
}

function remainingSeconds() {
  if (!Number.isFinite(currentState.endsAt)) return null;
  return Math.max(0, Math.ceil((currentState.endsAt - Date.now()) / 1000));
}

function renderTimerSummary() {
  if (currentState.isActive) {
    timerSummary.textContent = formatRemaining(remainingSeconds());
    cancelTimerButton.hidden = !Number.isFinite(currentState.endsAt);
    return;
  }
  timerSummary.textContent = selectedMinutes === null ? '未设置定时' : `已选择 ${selectedMinutes} 分钟`;
  cancelTimerButton.hidden = selectedMinutes === null;
}

function renderState() {
  statusCard.classList.toggle('active', currentState.isActive);
  statusText.textContent = currentState.isActive ? '常亮中' : '已停止';
  toggleButton.textContent = currentState.isActive ? '停止常亮' : '开启常亮';
  toggleButton.classList.toggle('stop', currentState.isActive);
  renderTimerSummary();
}

function selectPreset(minutes) {
  selectedMinutes = minutes;
  presetButtons.forEach((button) => {
    const buttonMinutes = parseMinutes(button.dataset.minutes);
    button.classList.toggle('selected', buttonMinutes === minutes);
  });
}

function showTimerError(message = '') {
  timerError.textContent = message;
  timerError.hidden = message === '';
  timerFooter.hidden = message !== '';
  customMinutes.toggleAttribute('aria-invalid', message !== '');
}

async function runAction(action) {
  if (isBusy) return;
  isBusy = true;
  toggleButton.disabled = true;
  try {
    currentState = await action();
    renderState();
  } catch {
    showTimerError('操作失败');
  } finally {
    isBusy = false;
    toggleButton.disabled = false;
  }
}

toggleButton.addEventListener('click', () => {
  showTimerError();
  void runAction(() => currentState.isActive ? api.stop() : api.start(selectedMinutes));
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showTimerError();
    const buttonMinutes = parseMinutes(button.dataset.minutes);
    const minutes = selectedMinutes === buttonMinutes ? null : buttonMinutes;
    selectPreset(minutes);
    if (currentState.isActive) {
      void runAction(() => minutes === null ? api.cancelTimer() : api.setTimer(minutes));
    } else {
      renderTimerSummary();
    }
  });
});

setCustomTimer.addEventListener('click', () => {
  const minutes = parseMinutes(customMinutes.value);
  if (minutes === null) {
    showTimerError('请输入 1 至 480 的整数');
    customMinutes.focus();
    return;
  }
  showTimerError();
  selectPreset(minutes);
  customMinutes.value = '';
  if (currentState.isActive) {
    void runAction(() => api.setTimer(minutes));
  } else {
    renderTimerSummary();
  }
});

customMinutes.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') setCustomTimer.click();
});

cancelTimerButton.addEventListener('click', () => {
  showTimerError();
  selectPreset(null);
  if (currentState.isActive) {
    void runAction(() => api.cancelTimer());
  } else {
    renderTimerSummary();
  }
});

quitButton.addEventListener('click', () => {
  const remember = rememberChoice.checked;
  closeDialog.close();
  void api.resolveClose('quit', remember);
});

trayButton.addEventListener('click', () => {
  const remember = rememberChoice.checked;
  closeDialog.close();
  void api.resolveClose('tray', remember);
});

closeDialog.addEventListener('cancel', () => {
  rememberChoice.checked = false;
});

api.onStateChanged((state) => {
  currentState = state;
  renderState();
});

api.onCloseRequested(() => {
  rememberChoice.checked = false;
  if (!closeDialog.open) closeDialog.showModal();
  trayButton.focus();
});

closeDialog.addEventListener('click', (event) => {
  const bounds = closeDialog.getBoundingClientRect();
  const isInside =
    event.clientX >= bounds.left &&
    event.clientX <= bounds.right &&
    event.clientY >= bounds.top &&
    event.clientY <= bounds.bottom;
  if (!isInside) closeDialog.close();
});

setInterval(() => {
  if (currentState.isActive && Number.isFinite(currentState.endsAt)) renderTimerSummary();
}, 1000);

api.getState().then((state) => {
  currentState = state;
  renderState();
}).catch(() => {
  showTimerError('初始化失败');
});
