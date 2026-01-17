/**
 * Type-safe IPC channel definitions
 */

import type { Result, Failure } from '@claude-team/core';
import type {
  WorkspaceDto,
  ProjectDto,
  TaskDto,
  AgentDto,
  EventDto,
  ApprovalDto,
  CreateWorkspaceDto,
  CreateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
  EventFilterDto,
  ApprovalFilterDto,
  AgentProgressPayload,
  ApprovalRequiredPayload,
} from '../../types/dto.js';
import type { AppState } from '../../types/index.js';

export type IpcResult<T> = Result<T, Failure>;

export interface IpcChannels {
  'workspace:list': () => IpcResult<readonly WorkspaceDto[]>;
  'workspace:get': (id: string) => IpcResult<WorkspaceDto>;
  'workspace:getCurrent': () => IpcResult<WorkspaceDto | null>;
  'workspace:create': (data: CreateWorkspaceDto) => IpcResult<WorkspaceDto>;

  'project:list': (workspaceId?: string) => IpcResult<readonly ProjectDto[]>;
  'project:get': (id: string) => IpcResult<ProjectDto>;
  'project:getCurrent': () => IpcResult<ProjectDto | null>;
  'project:switch': (id: string) => IpcResult<void>;
  'project:create': (data: CreateProjectDto) => IpcResult<ProjectDto>;

  'task:list': (filter?: TaskFilterDto) => IpcResult<readonly TaskDto[]>;
  'task:get': (id: string) => IpcResult<TaskDto>;
  'task:create': (data: CreateTaskDto) => IpcResult<TaskDto>;
  'task:update': (id: string, data: UpdateTaskDto) => IpcResult<TaskDto>;
  'task:cancel': (id: string) => IpcResult<void>;

  'agent:list': () => IpcResult<readonly AgentDto[]>;
  'agent:get': (id: string) => IpcResult<AgentDto>;
  'agent:start': (id: string, taskId: string) => IpcResult<void>;
  'agent:stop': (id: string) => IpcResult<void>;
  'agent:pause': (id: string) => IpcResult<void>;
  'agent:resume': (id: string) => IpcResult<void>;

  'event:list': (filter?: EventFilterDto) => IpcResult<readonly EventDto[]>;
  'event:subscribe': (types?: readonly string[]) => IpcResult<void>;
  'event:unsubscribe': () => IpcResult<void>;

  'approval:list': (filter?: ApprovalFilterDto) => IpcResult<readonly ApprovalDto[]>;
  'approval:get': (id: string) => IpcResult<ApprovalDto>;
  'approval:approve': (id: string) => IpcResult<ApprovalDto>;
  'approval:reject': (id: string, reason?: string) => IpcResult<ApprovalDto>;
  'approval:count': (projectId?: string) => IpcResult<number>;

  'system:getState': () => IpcResult<AppState>;
  'system:quit': () => IpcResult<void>;
}

export interface IpcPushChannels {
  'agent:progress': AgentProgressPayload;
  'task:updated': TaskDto;
  'approval:required': ApprovalRequiredPayload;
  'approval:updated': ApprovalDto;
  'event:new': EventDto;
}

export const IPC_INVOKE_CHANNELS: readonly (keyof IpcChannels)[] = [
  'workspace:list',
  'workspace:get',
  'workspace:getCurrent',
  'workspace:create',
  'project:list',
  'project:get',
  'project:getCurrent',
  'project:switch',
  'project:create',
  'task:list',
  'task:get',
  'task:create',
  'task:update',
  'task:cancel',
  'agent:list',
  'agent:get',
  'agent:start',
  'agent:stop',
  'agent:pause',
  'agent:resume',
  'event:list',
  'event:subscribe',
  'event:unsubscribe',
  'approval:list',
  'approval:get',
  'approval:approve',
  'approval:reject',
  'approval:count',
  'system:getState',
  'system:quit',
];

export const IPC_PUSH_CHANNELS: readonly (keyof IpcPushChannels)[] = [
  'agent:progress',
  'task:updated',
  'approval:required',
  'approval:updated',
  'event:new',
];
