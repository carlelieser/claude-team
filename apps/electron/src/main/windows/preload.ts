/**
 * Preload script for secure IPC communication
 */

import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { IpcChannels, IpcPushChannels } from '../ipc/channels.js';

type InvokeHandler = {
  [K in keyof IpcChannels]: (
    ...args: Parameters<IpcChannels[K]>
  ) => Promise<ReturnType<IpcChannels[K]>>;
};

type SubscribeHandler = {
  [K in keyof IpcPushChannels]: (
    callback: (payload: IpcPushChannels[K]) => void
  ) => () => void;
};

const invokeHandlers: InvokeHandler = {
  'workspace:list': () => ipcRenderer.invoke('workspace:list'),
  'workspace:get': (id) => ipcRenderer.invoke('workspace:get', id),
  'workspace:getCurrent': () => ipcRenderer.invoke('workspace:getCurrent'),

  'project:list': (workspaceId) =>
    ipcRenderer.invoke('project:list', workspaceId),
  'project:get': (id) => ipcRenderer.invoke('project:get', id),
  'project:getCurrent': () => ipcRenderer.invoke('project:getCurrent'),
  'project:switch': (id) => ipcRenderer.invoke('project:switch', id),

  'task:list': (filter) => ipcRenderer.invoke('task:list', filter),
  'task:get': (id) => ipcRenderer.invoke('task:get', id),
  'task:create': (data) => ipcRenderer.invoke('task:create', data),
  'task:update': (id, data) => ipcRenderer.invoke('task:update', id, data),
  'task:cancel': (id) => ipcRenderer.invoke('task:cancel', id),

  'agent:list': () => ipcRenderer.invoke('agent:list'),
  'agent:get': (id) => ipcRenderer.invoke('agent:get', id),
  'agent:start': (id, taskId) => ipcRenderer.invoke('agent:start', id, taskId),
  'agent:stop': (id) => ipcRenderer.invoke('agent:stop', id),
  'agent:pause': (id) => ipcRenderer.invoke('agent:pause', id),
  'agent:resume': (id) => ipcRenderer.invoke('agent:resume', id),

  'event:list': (filter) => ipcRenderer.invoke('event:list', filter),
  'event:subscribe': (types) => ipcRenderer.invoke('event:subscribe', types),
  'event:unsubscribe': () => ipcRenderer.invoke('event:unsubscribe'),

  'approval:list': (filter) => ipcRenderer.invoke('approval:list', filter),
  'approval:get': (id) => ipcRenderer.invoke('approval:get', id),
  'approval:approve': (id) => ipcRenderer.invoke('approval:approve', id),
  'approval:reject': (id, reason) => ipcRenderer.invoke('approval:reject', id, reason),
  'approval:count': (projectId) => ipcRenderer.invoke('approval:count', projectId),

  'system:getState': () => ipcRenderer.invoke('system:getState'),
  'system:quit': () => ipcRenderer.invoke('system:quit'),
};

function createSubscriptionHandler<K extends keyof IpcPushChannels>(
  channel: K
): (callback: (payload: IpcPushChannels[K]) => void) => () => void {
  return (callback: (payload: IpcPushChannels[K]) => void) => {
    const handler = (_event: IpcRendererEvent, payload: IpcPushChannels[K]) => {
      callback(payload);
    };

    ipcRenderer.on(channel, handler);

    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  };
}

const subscribeHandlers: SubscribeHandler = {
  'agent:progress': createSubscriptionHandler('agent:progress'),
  'task:updated': createSubscriptionHandler('task:updated'),
  'approval:required': createSubscriptionHandler('approval:required'),
  'approval:updated': createSubscriptionHandler('approval:updated'),
  'event:new': createSubscriptionHandler('event:new'),
};

const electronAPI = {
  invoke: invokeHandlers,
  subscribe: subscribeHandlers,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}
