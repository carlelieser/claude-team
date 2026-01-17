/**
 * Event-related IPC handlers
 */

import { ipcMain } from 'electron';
import { success, failure, type Failure, type EventSubscription } from '@claude-team/core';
import type { ServiceContainer } from '../../services/service-container.js';
import type { WindowManager } from '../../windows/window-manager.js';
import type { IpcResult } from '../channels.js';
import type { EventDto, EventFilterDto } from '../../../types/dto.js';

export interface EventHandlersConfig {
  readonly services: ServiceContainer;
  readonly windows: WindowManager;
}

const subscriptions = new Map<string, EventSubscription>();

function mapEvent(event: {
  id: string;
  type: string;
  source: string;
  projectId: string;
  workspaceId: string;
  payload: unknown;
  createdAt: Date;
  processed: boolean;
}): EventDto {
  return {
    id: event.id,
    type: event.type,
    source: event.source,
    projectId: event.projectId,
    workspaceId: event.workspaceId,
    payload: event.payload as Record<string, unknown>,
    timestamp: event.createdAt.toISOString(),
    processed: event.processed,
  };
}

export function registerEventHandlers(config: EventHandlersConfig): void {
  const { services, windows } = config;

  ipcMain.handle(
    'event:list',
    async (
      _event,
      filter?: EventFilterDto
    ): Promise<IpcResult<readonly EventDto[]>> => {
      try {
        let events;

        if (filter?.type) {
          events = await services.eventRepository.findByType(
            filter.type,
            filter.limit
          );
        } else if (filter?.projectId) {
          events = await services.eventRepository.findByProjectId(
            filter.projectId,
            filter.limit
          );
        } else {
          events = await services.eventRepository.findMany();
          if (filter?.limit) {
            events = events.slice(0, filter.limit);
          }
        }

        return success(events.map(mapEvent));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'event:subscribe',
    async (
      event,
      types?: readonly string[]
    ): Promise<IpcResult<void>> => {
      try {
        const webContentsId = String(event.sender.id);

        const existingSubscription = subscriptions.get(webContentsId);
        if (existingSubscription) {
          existingSubscription.unsubscribe();
        }

        const handler = (eventPayload: unknown) => {
          const typedPayload = eventPayload as {
            type: string;
            id: string;
            source: string;
            projectId: string;
            workspaceId: string;
            payload: unknown;
            timestamp: Date;
          };

          if (types && types.length > 0) {
            const matches = types.some((pattern) => {
              if (pattern === '*') {
                return true;
              }
              if (pattern.includes('*')) {
                const regex = new RegExp(
                  '^' + pattern.replace(/\*/g, '.*') + '$'
                );
                return regex.test(typedPayload.type);
              }
              return typedPayload.type === pattern;
            });

            if (!matches) {
              return;
            }
          }

          const eventDto: EventDto = {
            id: typedPayload.id,
            type: typedPayload.type,
            source: typedPayload.source,
            projectId: typedPayload.projectId,
            workspaceId: typedPayload.workspaceId,
            payload: typedPayload.payload as Record<string, unknown>,
            timestamp: typedPayload.timestamp.toISOString(),
            processed: false,
          };

          windows.broadcastToAll('event:new', eventDto);
        };

        const subscription = services.eventBus.subscribe('*', handler);
        subscriptions.set(webContentsId, subscription);

        services.logger.debug('Event subscription created', {
          webContentsId,
          types,
        });

        return success(undefined);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'event:unsubscribe',
    async (event): Promise<IpcResult<void>> => {
      try {
        const webContentsId = String(event.sender.id);

        const subscription = subscriptions.get(webContentsId);
        if (subscription) {
          subscription.unsubscribe();
          subscriptions.delete(webContentsId);
          services.logger.debug('Event subscription removed', { webContentsId });
        }

        return success(undefined);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );
}
