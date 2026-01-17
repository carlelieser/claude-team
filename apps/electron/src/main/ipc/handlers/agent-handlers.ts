/**
 * Agent-related IPC handlers
 */

import { ipcMain } from 'electron';
import { success, failure, type Failure } from '@claude-team/core';
import type { ServiceContainer } from '../../services/service-container.js';
import type { IpcResult } from '../channels.js';
import type { AgentDto } from '../../../types/dto.js';

export interface AgentHandlersConfig {
  readonly services: ServiceContainer;
}

const agentStatuses = new Map<
  string,
  { status: 'idle' | 'executing' | 'paused'; currentTaskId: string | null }
>();

function mapAgent(agent: {
  definition: {
    id: string;
    name: string;
    description: string;
    trustLevel: 'low' | 'medium' | 'high' | 'full';
  };
}): AgentDto {
  const statusInfo = agentStatuses.get(agent.definition.id) || {
    status: 'idle' as const,
    currentTaskId: null,
  };

  return {
    id: agent.definition.id,
    name: agent.definition.name,
    description: agent.definition.description,
    status: statusInfo.status,
    currentTaskId: statusInfo.currentTaskId,
    trustLevel: agent.definition.trustLevel,
  };
}

export function registerAgentHandlers(config: AgentHandlersConfig): void {
  const { services } = config;

  ipcMain.handle(
    'agent:list',
    async (): Promise<IpcResult<readonly AgentDto[]>> => {
      try {
        const agents = services.orchestrator.listAgents();
        return success(agents.map(mapAgent));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'agent:get',
    async (_event, id: string): Promise<IpcResult<AgentDto>> => {
      try {
        const agent = services.orchestrator.getAgent(id);

        if (!agent) {
          return failure({
            type: 'notFound',
            message: `Agent not found: ${id}`,
            resource: 'agent',
          });
        }

        return success(mapAgent(agent));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'agent:start',
    async (
      _event,
      id: string,
      taskId: string
    ): Promise<IpcResult<void>> => {
      try {
        const agent = services.orchestrator.getAgent(id);

        if (!agent) {
          return failure({
            type: 'notFound',
            message: `Agent not found: ${id}`,
            resource: 'agent',
          });
        }

        agentStatuses.set(id, { status: 'executing', currentTaskId: taskId });

        services.logger.info('Agent started', { agentId: id, taskId });

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
    'agent:stop',
    async (_event, id: string): Promise<IpcResult<void>> => {
      try {
        const agent = services.orchestrator.getAgent(id);

        if (!agent) {
          return failure({
            type: 'notFound',
            message: `Agent not found: ${id}`,
            resource: 'agent',
          });
        }

        agentStatuses.set(id, { status: 'idle', currentTaskId: null });

        services.logger.info('Agent stopped', { agentId: id });

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
    'agent:pause',
    async (_event, id: string): Promise<IpcResult<void>> => {
      try {
        const agent = services.orchestrator.getAgent(id);

        if (!agent) {
          return failure({
            type: 'notFound',
            message: `Agent not found: ${id}`,
            resource: 'agent',
          });
        }

        const current = agentStatuses.get(id);
        agentStatuses.set(id, {
          status: 'paused',
          currentTaskId: current?.currentTaskId ?? null,
        });

        services.logger.info('Agent paused', { agentId: id });

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
    'agent:resume',
    async (_event, id: string): Promise<IpcResult<void>> => {
      try {
        const agent = services.orchestrator.getAgent(id);

        if (!agent) {
          return failure({
            type: 'notFound',
            message: `Agent not found: ${id}`,
            resource: 'agent',
          });
        }

        const current = agentStatuses.get(id);
        agentStatuses.set(id, {
          status: current?.currentTaskId ? 'executing' : 'idle',
          currentTaskId: current?.currentTaskId ?? null,
        });

        services.logger.info('Agent resumed', { agentId: id });

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
