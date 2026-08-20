'use strict';

const seconds = document.querySelector('#seconds');
const complete = document.querySelector('#complete');

function render(state) {
  seconds.textContent = Math.max(0, state.remainingSeconds);
}

complete.addEventListener('click', () => window.eyeBreak.completeBreak());
window.eyeBreak.onDismissReminder(() => {
  complete.disabled = true;
  document.querySelector('.reminder-card').classList.add('is-closing');
});
window.eyeBreak.onStateUpdated(render);
window.eyeBreak.getState().then(render);
