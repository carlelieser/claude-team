/**
 * IPC event emitter for push events from main to renderer
 */

import type { WindowManager } from '../windows/window-manager.js';
import type { IpcPushChannels } from './channels.js';

export interface IpcEmitter {
  emit<K extends keyof IpcPushChannels>(
    channel: K,
    payload: IpcPushChannels[K]
  ): void;
}

export function createIpcEmitter(windows: WindowManager): IpcEmitter {
  return {
    emit<K extends keyof IpcPushChannels>(
      channel: K,
      payload: IpcPushChannels[K]
    ): void {
      windows.broadcastToAll(channel, payload);
    },
  };
}
