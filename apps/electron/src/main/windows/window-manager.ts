/**
 * Window manager for dashboard and popup windows
 */

import { BrowserWindow, screen, app } from 'electron';
import { join } from 'node:path';

export interface WindowManagerOptions {
  readonly webPath: string;
  readonly preloadPath: string;
}

export interface WindowManager {
  showDashboard(): BrowserWindow;
  hideDashboard(): void;
  showPopup(): BrowserWindow;
  hidePopup(): void;
  closeAll(): void;
  getDashboard(): BrowserWindow | null;
  getPopup(): BrowserWindow | null;
  broadcastToAll(channel: string, ...args: unknown[]): void;
}

const DASHBOARD_WIDTH = 1200;
const DASHBOARD_HEIGHT = 800;
const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 200;

export function createWindowManager(
  options: WindowManagerOptions
): WindowManager {
  const { webPath, preloadPath } = options;

  let dashboardWindow: BrowserWindow | null = null;
  let popupWindow: BrowserWindow | null = null;

  function createDashboard(): BrowserWindow {
    const window = new BrowserWindow({
      width: DASHBOARD_WIDTH,
      height: DASHBOARD_HEIGHT,
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    const indexPath = join(webPath, 'index.html');

    if (app.isPackaged) {
      window.loadFile(indexPath);
    } else {
      window.loadURL('http://localhost:5173');
    }

    window.on('ready-to-show', () => {
      window.show();
    });

    window.on('closed', () => {
      dashboardWindow = null;
    });

    return window;
  }

  function createPopup(): BrowserWindow {
    const cursor = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursor);
    const { workArea } = display;

    const x = Math.max(
      workArea.x,
      Math.min(cursor.x - POPUP_WIDTH / 2, workArea.x + workArea.width - POPUP_WIDTH)
    );
    const y = workArea.y + 50;

    const window = new BrowserWindow({
      width: POPUP_WIDTH,
      height: POPUP_HEIGHT,
      x,
      y,
      show: false,
      frame: false,
      transparent: true,
      resizable: false,
      movable: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    const popupPath = join(webPath, 'popup', 'index.html');

    if (app.isPackaged) {
      window.loadFile(popupPath);
    } else {
      window.loadURL('http://localhost:5173/popup');
    }

    window.on('ready-to-show', () => {
      window.show();
    });

    window.on('blur', () => {
      window.hide();
    });

    window.on('closed', () => {
      popupWindow = null;
    });

    return window;
  }

  return {
    showDashboard(): BrowserWindow {
      if (dashboardWindow) {
        if (dashboardWindow.isMinimized()) {
          dashboardWindow.restore();
        }
        dashboardWindow.focus();
        return dashboardWindow;
      }

      dashboardWindow = createDashboard();
      return dashboardWindow;
    },

    hideDashboard(): void {
      if (dashboardWindow) {
        dashboardWindow.hide();
      }
    },

    showPopup(): BrowserWindow {
      if (popupWindow) {
        popupWindow.show();
        popupWindow.focus();
        return popupWindow;
      }

      popupWindow = createPopup();
      return popupWindow;
    },

    hidePopup(): void {
      if (popupWindow) {
        popupWindow.hide();
      }
    },

    closeAll(): void {
      if (dashboardWindow) {
        dashboardWindow.close();
        dashboardWindow = null;
      }

      if (popupWindow) {
        popupWindow.close();
        popupWindow = null;
      }
    },

    getDashboard(): BrowserWindow | null {
      return dashboardWindow;
    },

    getPopup(): BrowserWindow | null {
      return popupWindow;
    },

    broadcastToAll(channel: string, ...args: unknown[]): void {
      if (dashboardWindow && !dashboardWindow.isDestroyed()) {
        dashboardWindow.webContents.send(channel, ...args);
      }

      if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.webContents.send(channel, ...args);
      }
    },
  };
}
