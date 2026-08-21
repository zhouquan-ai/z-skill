'use strict';

const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
  const listener = (_event, value) => callback(value);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('screenKeeper', {
  getState: () => ipcRenderer.invoke('keeper:get-state'),
  start: (minutes) => ipcRenderer.invoke('keeper:start', minutes),
  stop: () => ipcRenderer.invoke('keeper:stop'),
  setTimer: (minutes) => ipcRenderer.invoke('keeper:set-timer', minutes),
  cancelTimer: () => ipcRenderer.invoke('keeper:cancel-timer'),
  resolveClose: (action, remember) => ipcRenderer.invoke('window:resolve-close', { action, remember }),
  onStateChanged: (callback) => subscribe('keeper:state-changed', callback),
  onCloseRequested: (callback) => subscribe('window:close-requested', callback),
});
