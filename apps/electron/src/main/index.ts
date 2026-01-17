/**
 * Electron main process entry point
 */

import { app, BrowserWindow } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, getApp } from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const application = getApp();
    if (application) {
      application.windows.showDashboard();
    }
  });

  app.whenReady().then(async () => {
    try {
      const agentsDirectory = join(__dirname, '..', '..', '..', '..', 'agents');
      const webPath = app.isPackaged
        ? join(process.resourcesPath, 'web')
        : join(__dirname, '..', '..', '..', 'web', 'build');

      const application = await createApp({
        agentsDirectory,
        webPath,
      });

      application.shortcuts.registerAll();
      application.tray.show();
      application.services.taskProcessor.start();

      application.services.logger.info('Application started', {
        version: app.getVersion(),
        isPackaged: app.isPackaged,
      });
    } catch (error) {
      console.error('Failed to start application:', error);
      app.quit();
    }
  });

  app.on('activate', () => {
    const application = getApp();
    if (application && BrowserWindow.getAllWindows().length === 0) {
      application.windows.showDashboard();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // Keep app running in tray on macOS
    }
  });

  app.on('before-quit', async (event) => {
    const application = getApp();
    if (application) {
      event.preventDefault();
      await application.shutdown();
      app.exit(0);
    }
  });

  if (process.platform === 'darwin') {
    app.dock.hide();
  }
}
