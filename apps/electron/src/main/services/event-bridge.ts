/**
 * Bridge between EventBus domain events and IPC push channels
 *
 * This service listens to relevant domain events from the EventBus
 * and forwards them to the renderer process via IPC.
 */

import type { PersistentEventBus, Event, EventSubscription } from '@claude-team/core';
import type { WindowManager } from '../windows/window-manager.js';
import type { AgentProgressPayload } from '../../types/dto.js';
import type { Logger } from '@claude-team/core';

export interface EventBridgeConfig {
  readonly eventBus: PersistentEventBus;
  readonly windows: WindowManager;
  readonly logger: Logger;
}

export interface EventBridge {
  start(): void;
  stop(): void;
}

interface AgentProgressPayloadEvent {
  agentId: string;
  taskId: string;
  progress: number;
  currentTurn: number;
  maxTurns: number;
  message: string;
  type: string;
  toolName?: string;
}

export function createEventBridge(config: EventBridgeConfig): EventBridge {
  const { eventBus, windows, logger } = config;
  let progressSubscription: EventSubscription | undefined;
  let taskUpdatesSubscription: EventSubscription | undefined;

  function handleAgentProgress(event: Event): void {
    const payload = event.payload as AgentProgressPayloadEvent;

    const progressDto: AgentProgressPayload = {
      agentId: payload.agentId ?? event.source,
      taskId: payload.taskId ?? '',
      progress: payload.progress ?? 0,
      message: payload.message ?? '',
    };

    logger.debug('Broadcasting agent progress to renderer', {
      agentId: progressDto.agentId,
      taskId: progressDto.taskId,
      progress: progressDto.progress,
    });

    windows.broadcastToAll('agent:progress', progressDto);
  }

  function handleTaskUpdate(event: Event): void {
    const payload = event.payload as { taskId?: string };
    const taskId = payload.taskId;

    if (!taskId) {
      return;
    }

    logger.debug('Task event received', {
      type: event.type,
      taskId,
    });
  }

  return {
    start(): void {
      logger.info('Starting event bridge');

      progressSubscription = eventBus.subscribe('agent.progress', handleAgentProgress);

      taskUpdatesSubscription = eventBus.subscribe('task.*', handleTaskUpdate);

      logger.info('Event bridge started');
    },

    stop(): void {
      logger.info('Stopping event bridge');

      if (progressSubscription) {
        progressSubscription.unsubscribe();
        progressSubscription = undefined;
      }

      if (taskUpdatesSubscription) {
        taskUpdatesSubscription.unsubscribe();
        taskUpdatesSubscription = undefined;
      }

      logger.info('Event bridge stopped');
    },
  };
}
