'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('eyeBreak', {
  getState: () => ipcRenderer.invoke('get-state'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  toggleRunning: () => ipcRenderer.invoke('toggle-running'),
  completeBreak: () => ipcRenderer.invoke('complete-break'),
  resolveCloseChoice: (choice, remember) => ipcRenderer.invoke('resolve-close-choice', { choice, remember }),
  cancelCloseChoice: () => ipcRenderer.invoke('cancel-close-choice'),
  onCloseChoiceRequested: (listener) => {
    const wrapped = () => listener();
    ipcRenderer.on('close-choice-requested', wrapped);
    return () => ipcRenderer.removeListener('close-choice-requested', wrapped);
  },
  onDismissReminder: (listener) => {
    const wrapped = () => listener();
    ipcRenderer.on('dismiss-reminder', wrapped);
    return () => ipcRenderer.removeListener('dismiss-reminder', wrapped);
  },
  onStateUpdated: (listener) => {
    const wrapped = (_event, state) => listener(state);
    ipcRenderer.on('state-updated', wrapped);
    return () => ipcRenderer.removeListener('state-updated', wrapped);
  }
});
