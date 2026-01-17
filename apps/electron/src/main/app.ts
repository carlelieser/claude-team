/**
 * Application singleton managing core services and lifecycle
 */

import { app } from 'electron';
import { join } from 'node:path';
import {
  type ServiceContainer,
  createServiceContainer,
} from './services/service-container.js';
import { type TrayManager, createTrayManager } from './tray/tray-manager.js';
import { type WindowManager, createWindowManager } from './windows/window-manager.js';
import {
  type ShortcutManager,
  createShortcutManager,
} from './shortcuts/shortcut-manager.js';
import { registerIpcHandlers, type IpcHandlers } from './ipc/ipc-handlers.js';
import { type EventBridge, createEventBridge } from './services/event-bridge.js';
import type { AppStatus } from '../types/index.js';

interface MutableAppState {
  status: AppStatus;
  activeTaskCount: number;
  pendingApprovals: number;
  currentProjectId: string | null;
  currentWorkspaceId: string | null;
}

export interface AppConfig {
  readonly agentsDirectory: string;
  readonly databasePath?: string;
  readonly webPath: string;
}

export interface App {
  readonly services: ServiceContainer;
  readonly tray: TrayManager;
  readonly windows: WindowManager;
  readonly shortcuts: ShortcutManager;
  readonly ipcHandlers: IpcHandlers;
  readonly eventBridge: EventBridge;
  getState(): MutableAppState;
  updateStatus(status: AppStatus): void;
  shutdown(): Promise<void>;
}

let appInstance: App | null = null;

export async function createApp(config: AppConfig): Promise<App> {
  if (appInstance) {
    return appInstance;
  }

  const serviceConfig = {
    agentsDirectory: config.agentsDirectory,
    ...(config.databasePath !== undefined && { databasePath: config.databasePath }),
  };

  const services = await createServiceContainer(serviceConfig);

  const state: MutableAppState = {
    status: 'idle',
    activeTaskCount: 0,
    pendingApprovals: 0,
    currentProjectId: null,
    currentWorkspaceId: null,
  };

  const windows = createWindowManager({
    webPath: config.webPath,
    preloadPath: join(app.getAppPath(), 'dist', 'preload', 'preload.cjs'),
  });

  const tray = createTrayManager({
    services,
    onNewTask: () => windows.showPopup(),
    onShowDashboard: () => windows.showDashboard(),
    onQuit: () => app.quit(),
    getState: () => state,
  });

  const shortcuts = createShortcutManager({
    onNewTask: () => windows.showPopup(),
    onShowDashboard: () => windows.showDashboard(),
  });

  const ipcHandlers = registerIpcHandlers({
    services,
    windows,
    getState: () => state,
    updateState: (updates) => {
      Object.assign(state, updates);
      tray.updateMenu();
    },
  });

  const eventBridge = createEventBridge({
    eventBus: services.eventBus,
    windows,
    logger: services.logger,
  });

  eventBridge.start();

  services.eventBus.subscribe('*', () => {
    ipcHandlers.broadcastEvent();
  });

  services.eventBus.subscribe('agent.started', () => {
    state.activeTaskCount++;
    tray.updateStatus('working');
    tray.updateMenu();
  });

  services.eventBus.subscribe('agent.completed', () => {
    state.activeTaskCount = Math.max(0, state.activeTaskCount - 1);
    if (state.activeTaskCount === 0) {
      tray.updateStatus('idle');
    }
    tray.updateMenu();
  });

  services.eventBus.subscribe('agent.error', () => {
    state.activeTaskCount = Math.max(0, state.activeTaskCount - 1);
    tray.updateStatus('error');
    tray.updateMenu();
  });

  appInstance = {
    services,
    tray,
    windows,
    shortcuts,
    ipcHandlers,
    eventBridge,

    getState(): MutableAppState {
      return { ...state };
    },

    updateStatus(status: AppStatus): void {
      Object.assign(state, { status });
      tray.updateStatus(status);
    },

    async shutdown(): Promise<void> {
      services.logger.info('Shutting down application');

      eventBridge.stop();
      shortcuts.unregisterAll();
      tray.destroy();
      windows.closeAll();

      await services.shutdown();

      appInstance = null;

      services.logger.info('Application shutdown complete');
    },
  };

  return appInstance;
}

export function getApp(): App | null {
  return appInstance;
}
