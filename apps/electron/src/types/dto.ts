/**
 * Data Transfer Objects for IPC communication
 */

import type { TaskStatus } from '@claude-team/core';

export interface WorkspaceDto {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly createdAt: string;
  readonly projectCount: number;
}

export interface ProjectDto {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly path: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TaskDto {
  readonly id: string;
  readonly projectId: string;
  readonly agentId: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly priority: number;
  readonly parentId: string | null;
  readonly createdAt: string;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly error: string | null;
}

export interface AgentDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: 'idle' | 'executing' | 'paused';
  readonly currentTaskId: string | null;
  readonly trustLevel: 'low' | 'medium' | 'high' | 'full';
}

export interface EventDto {
  readonly id: string;
  readonly type: string;
  readonly source: string;
  readonly projectId: string;
  readonly workspaceId: string;
  readonly payload: Record<string, unknown>;
  readonly timestamp: string;
  readonly processed: boolean;
}

export interface CreateTaskDto {
  readonly projectId: string;
  readonly title: string;
  readonly description?: string;
  readonly agentId?: string;
  readonly priority?: number;
  readonly parentId?: string;
}

export interface UpdateTaskDto {
  readonly title?: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly agentId?: string;
  readonly priority?: number;
}

export interface TaskFilterDto {
  readonly projectId?: string;
  readonly agentId?: string;
  readonly status?: TaskStatus;
  readonly parentId?: string;
}

export interface EventFilterDto {
  readonly type?: string;
  readonly source?: string;
  readonly projectId?: string;
  readonly limit?: number;
}

export interface PaginationDto {
  readonly offset?: number;
  readonly limit?: number;
}

export interface AgentProgressPayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly progress: number;
  readonly message: string;
  readonly currentTurn?: number;
  readonly maxTurns?: number;
  readonly type?: 'text' | 'tool_use' | 'tool_result' | 'status';
  readonly toolName?: string;
}

export interface ApprovalRequiredPayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly action: string;
  readonly description: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalDto {
  readonly id: string;
  readonly taskId: string | null;
  readonly agentId: string;
  readonly projectId: string;
  readonly actionType: string;
  readonly target: string | null;
  readonly input: Record<string, unknown> | null;
  readonly output: Record<string, unknown> | null;
  readonly reasoning: string | null;
  readonly approvalRequired: boolean;
  readonly approvalStatus: ApprovalStatus | null;
  readonly approvedAt: string | null;
  readonly createdAt: string;
  readonly durationMs: number | null;
}

export interface ApprovalFilterDto {
  readonly projectId?: string;
  readonly agentId?: string;
  readonly status?: ApprovalStatus;
}
