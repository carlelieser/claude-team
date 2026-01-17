/**
 * Builder for tray context menu
 */

import { Menu, type MenuItemConstructorOptions } from 'electron';
import type { ServiceContainer } from '../services/service-container.js';
import type { AppState } from '../../types/index.js';

export interface TrayMenuBuilderOptions {
  readonly services: ServiceContainer;
  readonly onNewTask: () => void;
  readonly onShowDashboard: () => void;
  readonly onPauseAll: () => void;
  readonly onResumeAll: () => void;
  readonly onQuit: () => void;
  readonly getState: () => AppState;
}

export interface TrayMenuBuilder {
  build(): Menu;
}

export function createTrayMenuBuilder(
  options: TrayMenuBuilderOptions
): TrayMenuBuilder {
  const {
    services,
    onNewTask,
    onShowDashboard,
    onPauseAll,
    onResumeAll,
    onQuit,
    getState,
  } = options;

  return {
    build(): Menu {
      const state = getState();
      const agents = services.orchestrator.listAgents();
      const isProcessing = state.activeTaskCount > 0;

      const menuItems: MenuItemConstructorOptions[] = [];

      if (agents.length > 0) {
        menuItems.push({
          label: 'Agents',
          type: 'submenu',
          submenu: agents.map((agent) => ({
            label: agent.definition.name,
            enabled: false,
          })),
        });

        menuItems.push({ type: 'separator' });
      }

      if (state.currentProjectId) {
        menuItems.push({
          label: `Project: ${state.currentProjectId}`,
          enabled: false,
        });
        menuItems.push({ type: 'separator' });
      }

      menuItems.push({
        label: 'New Task',
        accelerator: 'CmdOrCtrl+N',
        click: onNewTask,
      });

      menuItems.push({
        label: 'View Dashboard',
        accelerator: 'CmdOrCtrl+D',
        click: onShowDashboard,
      });

      menuItems.push({ type: 'separator' });

      if (isProcessing) {
        menuItems.push({
          label: `Active Tasks: ${state.activeTaskCount}`,
          enabled: false,
        });

        menuItems.push({
          label: 'Pause All Agents',
          accelerator: 'CmdOrCtrl+P',
          click: onPauseAll,
        });
      } else {
        menuItems.push({
          label: 'No Active Tasks',
          enabled: false,
        });

        if (services.taskProcessor.isRunning()) {
          menuItems.push({
            label: 'Resume Processing',
            click: onResumeAll,
          });
        }
      }

      if (state.pendingApprovals > 0) {
        menuItems.push({ type: 'separator' });
        menuItems.push({
          label: `Pending Approvals: ${state.pendingApprovals}`,
          type: 'submenu',
          submenu: [
            {
              label: 'View in Dashboard',
              click: onShowDashboard,
            },
          ],
        });
      }

      menuItems.push({ type: 'separator' });

      menuItems.push({
        label: 'Quit Claude Team',
        accelerator: 'CmdOrCtrl+Q',
        click: onQuit,
      });

      return Menu.buildFromTemplate(menuItems);
    },
  };
}
