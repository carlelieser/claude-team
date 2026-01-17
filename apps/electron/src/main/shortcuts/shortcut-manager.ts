/**
 * Global keyboard shortcut manager
 */

import { globalShortcut } from 'electron';

export interface ShortcutManagerOptions {
  readonly onNewTask: () => void;
  readonly onShowDashboard: () => void;
}

export interface ShortcutManager {
  registerAll(): void;
  unregisterAll(): void;
}

const SHORTCUT_NEW_TASK = 'CommandOrControl+Shift+N';
const SHORTCUT_SHOW_DASHBOARD = 'CommandOrControl+Shift+D';

export function createShortcutManager(
  options: ShortcutManagerOptions
): ShortcutManager {
  const { onNewTask, onShowDashboard } = options;

  return {
    registerAll(): void {
      globalShortcut.register(SHORTCUT_NEW_TASK, () => {
        onNewTask();
      });

      globalShortcut.register(SHORTCUT_SHOW_DASHBOARD, () => {
        onShowDashboard();
      });
    },

    unregisterAll(): void {
      globalShortcut.unregister(SHORTCUT_NEW_TASK);
      globalShortcut.unregister(SHORTCUT_SHOW_DASHBOARD);
    },
  };
}
