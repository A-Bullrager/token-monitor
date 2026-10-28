'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('tm', {
  bootstrap: () => ipcRenderer.invoke('app:bootstrap'),
  refresh: () => ipcRenderer.invoke('data:refresh'),
  saveConfig: (patch) => ipcRenderer.invoke('config:save', patch),
  testConnection: (payload) => ipcRenderer.invoke('config:test', payload),
  clearCredentials: () => ipcRenderer.invoke('config:clear'),
  setView: (view) => ipcRenderer.invoke('window:set-view', view),
  setPinned: (pinned) => ipcRenderer.invoke('window:pin', pinned),
  applyTheme: (theme) => ipcRenderer.invoke('theme:apply', theme),
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  quit: () => ipcRenderer.send('app:quit'),
  openUsage: () => ipcRenderer.invoke('app:open-usage'),
  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
  ready: () => ipcRenderer.send('ui:ready'),
  onViewChange: (callback) => {
    const listener = (_event, value) => callback(value === 'deck' ? 'deck' : 'strip')
    ipcRenderer.on('view:changed', listener)
    return () => ipcRenderer.removeListener('view:changed', listener)
  },
  onAction: (callback) => {
    const listener = (_event, action) => callback(String(action || ''))
    ipcRenderer.on('ui:action', listener)
    return () => ipcRenderer.removeListener('ui:action', listener)
  }
})
