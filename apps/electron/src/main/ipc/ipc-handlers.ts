/**
 * IPC handlers registration
 */

import { ipcMain, app } from 'electron';
import { success, failure, type Failure } from '@claude-team/core';
import type { ServiceContainer } from '../services/service-container.js';
import type { WindowManager } from '../windows/window-manager.js';
import type { AppState } from '../../types/index.js';
import type { IpcResult } from './channels.js';
import type { EventDto } from '../../types/dto.js';
import { registerProjectHandlers } from './handlers/project-handlers.js';
import { registerTaskHandlers } from './handlers/task-handlers.js';
import { registerAgentHandlers } from './handlers/agent-handlers.js';
import { registerEventHandlers } from './handlers/event-handlers.js';
import { registerApprovalHandlers } from './handlers/approval-handlers.js';

export interface IpcHandlersConfig {
  readonly services: ServiceContainer;
  readonly windows: WindowManager;
  readonly getState: () => AppState;
  readonly updateState: (updates: Partial<AppState>) => void;
}

export interface IpcHandlers {
  broadcastEvent(): void;
}

export function registerIpcHandlers(config: IpcHandlersConfig): IpcHandlers {
  const { services, windows, getState, updateState } = config;

  registerProjectHandlers({ services, getState, updateState });
  registerTaskHandlers({ services, windows, getState });
  registerAgentHandlers({ services });
  registerEventHandlers({ services, windows });
  registerApprovalHandlers({ services, windows, getState, updateState });

  ipcMain.handle(
    'system:getState',
    async (): Promise<IpcResult<AppState>> => {
      try {
        return success(getState());
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'system:quit',
    async (): Promise<IpcResult<void>> => {
      try {
        app.quit();
        return success(undefined);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  services.logger.info('IPC handlers registered');

  return {
    broadcastEvent(): void {
      services.eventBus
        .getRecentEvents(1)
        .then((events) => {
          if (events.length > 0) {
            const event = events[0];
            if (event) {
              const eventDto: EventDto = {
                id: event.id,
                type: event.type,
                source: event.source,
                projectId: event.projectId,
                workspaceId: event.workspaceId,
                payload: event.payload,
                timestamp: event.timestamp.toISOString(),
                processed: false,
              };
              windows.broadcastToAll('event:new', eventDto);
            }
          }
        })
        .catch((error) => {
          services.logger.error('Failed to broadcast event', {
            error: error instanceof Error ? error.message : String(error),
          });
        });
    },
  };
}
