/**
 * System tray manager
 */

import { Tray, nativeImage, app } from 'electron';
import { join } from 'node:path';
import type { ServiceContainer } from '../services/service-container.js';
import type { AppState, AppStatus } from '../../types/index.js';
import {
  createTrayMenuBuilder,
  type TrayMenuBuilder,
} from './tray-menu-builder.js';

export interface TrayManagerOptions {
  readonly services: ServiceContainer;
  readonly onNewTask: () => void;
  readonly onShowDashboard: () => void;
  readonly onQuit: () => void;
  readonly getState: () => AppState;
}

export interface TrayManager {
  show(): void;
  hide(): void;
  destroy(): void;
  updateStatus(status: AppStatus): void;
  updateMenu(): void;
}

const ICON_NAMES: Record<AppStatus, string> = {
  idle: 'tray-idle.png',
  working: 'tray-working.png',
  attention: 'tray-attention.png',
  error: 'tray-error.png',
};

export function createTrayManager(options: TrayManagerOptions): TrayManager {
  const { services, onNewTask, onShowDashboard, onQuit, getState } = options;

  let tray: Tray | null = null;
  let currentStatus: AppStatus = 'idle';
  let animationInterval: NodeJS.Timeout | null = null;
  let animationFrame = 0;

  const iconsPath = app.isPackaged
    ? join(process.resourcesPath, 'assets', 'icons')
    : join(app.getAppPath(), 'assets', 'icons');

  const menuBuilder: TrayMenuBuilder = createTrayMenuBuilder({
    services,
    onNewTask,
    onShowDashboard,
    onPauseAll: () => {
      services.taskProcessor.stop();
      updateMenu();
    },
    onResumeAll: () => {
      services.taskProcessor.start();
      updateMenu();
    },
    onQuit,
    getState,
  });

  function getIconPath(status: AppStatus, frame?: number): string {
    if (status === 'working' && frame !== undefined) {
      return join(iconsPath, `tray-working-${frame}.png`);
    }
    return join(iconsPath, ICON_NAMES[status]);
  }

  function loadIcon(status: AppStatus, frame?: number): Electron.NativeImage {
    try {
      const iconPath = getIconPath(status, frame);
      const icon = nativeImage.createFromPath(iconPath);

      if (icon.isEmpty()) {
        services.logger.warn('Failed to load tray icon, using empty icon', {
          iconPath,
        });
        return nativeImage.createEmpty();
      }

      if (process.platform === 'darwin') {
        icon.setTemplateImage(true);
      }

      return icon;
    } catch {
      services.logger.error('Error loading tray icon');
      return nativeImage.createEmpty();
    }
  }

  function startAnimation(): void {
    if (animationInterval) {
      return;
    }

    animationInterval = setInterval(() => {
      animationFrame = (animationFrame + 1) % 4;
      if (tray) {
        tray.setImage(loadIcon('working', animationFrame));
      }
    }, 250);
  }

  function stopAnimation(): void {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
      animationFrame = 0;
    }
  }

  function updateMenu(): void {
    if (tray) {
      tray.setContextMenu(menuBuilder.build());
    }
  }

  return {
    show(): void {
      if (tray) {
        return;
      }

      tray = new Tray(loadIcon(currentStatus));
      tray.setToolTip('Claude Team');
      tray.setContextMenu(menuBuilder.build());

      tray.on('click', () => {
        onShowDashboard();
      });

      services.logger.info('Tray shown');
    },

    hide(): void {
      if (tray) {
        tray.destroy();
        tray = null;
        stopAnimation();
        services.logger.info('Tray hidden');
      }
    },

    destroy(): void {
      stopAnimation();
      if (tray) {
        tray.destroy();
        tray = null;
      }
    },

    updateStatus(status: AppStatus): void {
      currentStatus = status;

      if (!tray) {
        return;
      }

      if (status === 'working') {
        startAnimation();
      } else {
        stopAnimation();
        tray.setImage(loadIcon(status));
      }

      const tooltips: Record<AppStatus, string> = {
        idle: 'Claude Team - Idle',
        working: 'Claude Team - Processing tasks...',
        attention: 'Claude Team - Action required',
        error: 'Claude Team - Error occurred',
      };

      tray.setToolTip(tooltips[status]);

      services.logger.debug('Tray status updated', { status });
    },

    updateMenu,
  };
}
