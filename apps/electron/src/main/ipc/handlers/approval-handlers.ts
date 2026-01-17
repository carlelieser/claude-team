/**
 * Approval workflow IPC handlers
 */

import { ipcMain } from 'electron';
import { success, failure, type Failure } from '@claude-team/core';
import type { AgentAction } from '@claude-team/database';
import type { ServiceContainer } from '../../services/service-container.js';
import type { WindowManager } from '../../windows/window-manager.js';
import type { IpcResult } from '../channels.js';
import type { ApprovalDto, ApprovalFilterDto } from '../../../types/dto.js';
import type { AppState } from '../../../types/index.js';

export interface ApprovalHandlersConfig {
  readonly services: ServiceContainer;
  readonly windows: WindowManager;
  readonly getState: () => AppState;
  readonly updateState: (updates: Partial<AppState>) => void;
}

function mapApproval(action: AgentAction): ApprovalDto {
  return {
    id: action.id,
    taskId: action.taskId,
    agentId: action.agentId,
    projectId: action.projectId,
    actionType: action.actionType,
    target: action.target,
    input: action.input as Record<string, unknown> | null,
    output: action.output as Record<string, unknown> | null,
    reasoning: action.reasoning,
    approvalRequired: action.approvalRequired,
    approvalStatus: action.approvalStatus as ApprovalDto['approvalStatus'],
    approvedAt: action.approvedAt?.toISOString() ?? null,
    createdAt: action.createdAt.toISOString(),
    durationMs: action.durationMs,
  };
}

export function registerApprovalHandlers(config: ApprovalHandlersConfig): void {
  const { services, windows, getState, updateState } = config;

  ipcMain.handle(
    'approval:list',
    async (
      _event,
      filter?: ApprovalFilterDto
    ): Promise<IpcResult<readonly ApprovalDto[]>> => {
      try {
        let actions: AgentAction[];

        if (filter?.status === 'pending') {
          actions = await services.agentActionRepository.findPendingApprovals(
            filter.projectId
          );
        } else if (filter?.projectId) {
          actions = await services.agentActionRepository.findByProjectId(
            filter.projectId
          );
        } else if (filter?.agentId) {
          actions = await services.agentActionRepository.findByAgentId(
            filter.agentId
          );
        } else {
          actions = await services.agentActionRepository.findPendingApprovals();
        }

        return success(actions.map(mapApproval));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'approval:get',
    async (_event, id: string): Promise<IpcResult<ApprovalDto>> => {
      try {
        const action = await services.agentActionRepository.findById(id);

        if (!action) {
          return failure({
            type: 'notFound',
            message: `Approval not found: ${id}`,
            resource: 'approval',
          });
        }

        return success(mapApproval(action));
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'approval:approve',
    async (_event, id: string): Promise<IpcResult<ApprovalDto>> => {
      try {
        const action = await services.agentActionRepository.approveAction(id);

        if (!action) {
          return failure({
            type: 'notFound',
            message: `Approval not found: ${id}`,
            resource: 'approval',
          });
        }

        const approvalDto = mapApproval(action);

        windows.broadcastToAll('approval:updated', approvalDto);

        await updatePendingApprovalsCount(services, getState, updateState);

        services.logger.info('Approval approved', {
          approvalId: id,
          agentId: action.agentId,
          actionType: action.actionType,
        });

        await services.eventBus.publish({
          type: 'approval.approved',
          source: 'system',
          projectId: action.projectId,
          workspaceId: getState().currentWorkspaceId ?? '',
          payload: {
            approvalId: id,
            agentId: action.agentId,
            actionType: action.actionType,
          },
        });

        return success(approvalDto);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'approval:reject',
    async (
      _event,
      id: string,
      reason?: string
    ): Promise<IpcResult<ApprovalDto>> => {
      try {
        const action = await services.agentActionRepository.rejectAction(id);

        if (!action) {
          return failure({
            type: 'notFound',
            message: `Approval not found: ${id}`,
            resource: 'approval',
          });
        }

        const approvalDto = mapApproval(action);

        windows.broadcastToAll('approval:updated', approvalDto);

        await updatePendingApprovalsCount(services, getState, updateState);

        services.logger.info('Approval rejected', {
          approvalId: id,
          agentId: action.agentId,
          actionType: action.actionType,
          reason,
        });

        await services.eventBus.publish({
          type: 'approval.rejected',
          source: 'system',
          projectId: action.projectId,
          workspaceId: getState().currentWorkspaceId ?? '',
          payload: {
            approvalId: id,
            agentId: action.agentId,
            actionType: action.actionType,
            reason,
          },
        });

        return success(approvalDto);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );

  ipcMain.handle(
    'approval:count',
    async (_event, projectId?: string): Promise<IpcResult<number>> => {
      try {
        const pendingApprovals =
          await services.agentActionRepository.findPendingApprovals(projectId);

        return success(pendingApprovals.length);
      } catch (error) {
        return failure({
          type: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        } as Failure);
      }
    }
  );
}

async function updatePendingApprovalsCount(
  services: ServiceContainer,
  getState: () => AppState,
  updateState: (updates: Partial<AppState>) => void
): Promise<void> {
  try {
    const state = getState();
    const pendingApprovals =
      await services.agentActionRepository.findPendingApprovals(
        state.currentProjectId ?? undefined
      );

    updateState({ pendingApprovals: pendingApprovals.length });
  } catch (error) {
    services.logger.error('Failed to update pending approvals count', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
