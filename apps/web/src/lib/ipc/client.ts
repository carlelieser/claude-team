/**
 * IPC client for renderer process communication with main process
 */

import type { Result, Failure, TaskStatus } from '@claude-team/core';

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

export interface AppState {
  readonly status: 'idle' | 'working' | 'attention' | 'error';
  readonly activeTaskCount: number;
  readonly pendingApprovals: number;
  readonly currentProjectId: string | null;
  readonly currentWorkspaceId: string | null;
}

export interface AgentProgressPayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly progress: number;
  readonly message: string;
}

export interface ApprovalRequiredPayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly action: string;
  readonly description: string;
}

type IpcResult<T> = Result<T, Failure>;

interface ElectronAPI {
  readonly invoke: {
    'workspace:list': () => Promise<IpcResult<readonly WorkspaceDto[]>>;
    'workspace:get': (id: string) => Promise<IpcResult<WorkspaceDto>>;
    'workspace:getCurrent': () => Promise<IpcResult<WorkspaceDto | null>>;
    'project:list': (workspaceId?: string) => Promise<IpcResult<readonly ProjectDto[]>>;
    'project:get': (id: string) => Promise<IpcResult<ProjectDto>>;
    'project:getCurrent': () => Promise<IpcResult<ProjectDto | null>>;
    'project:switch': (id: string) => Promise<IpcResult<void>>;
    'task:list': (filter?: TaskFilterDto) => Promise<IpcResult<readonly TaskDto[]>>;
    'task:get': (id: string) => Promise<IpcResult<TaskDto>>;
    'task:create': (data: CreateTaskDto) => Promise<IpcResult<TaskDto>>;
    'task:update': (id: string, data: UpdateTaskDto) => Promise<IpcResult<TaskDto>>;
    'task:cancel': (id: string) => Promise<IpcResult<void>>;
    'agent:list': () => Promise<IpcResult<readonly AgentDto[]>>;
    'agent:get': (id: string) => Promise<IpcResult<AgentDto>>;
    'agent:start': (id: string, taskId: string) => Promise<IpcResult<void>>;
    'agent:stop': (id: string) => Promise<IpcResult<void>>;
    'agent:pause': (id: string) => Promise<IpcResult<void>>;
    'agent:resume': (id: string) => Promise<IpcResult<void>>;
    'event:list': (filter?: EventFilterDto) => Promise<IpcResult<readonly EventDto[]>>;
    'event:subscribe': (types?: readonly string[]) => Promise<IpcResult<void>>;
    'event:unsubscribe': () => Promise<IpcResult<void>>;
    'approval:list': (filter?: ApprovalFilterDto) => Promise<IpcResult<readonly ApprovalDto[]>>;
    'approval:get': (id: string) => Promise<IpcResult<ApprovalDto>>;
    'approval:approve': (id: string) => Promise<IpcResult<ApprovalDto>>;
    'approval:reject': (id: string, reason?: string) => Promise<IpcResult<ApprovalDto>>;
    'approval:count': (projectId?: string) => Promise<IpcResult<number>>;
    'system:getState': () => Promise<IpcResult<AppState>>;
    'system:quit': () => Promise<IpcResult<void>>;
  };
  readonly subscribe: {
    'agent:progress': (callback: (payload: AgentProgressPayload) => void) => () => void;
    'task:updated': (callback: (payload: TaskDto) => void) => () => void;
    'approval:required': (callback: (payload: ApprovalRequiredPayload) => void) => () => void;
    'approval:updated': (callback: (payload: ApprovalDto) => void) => () => void;
    'event:new': (callback: (payload: EventDto) => void) => () => void;
  };
}

export type { ElectronAPI };

function getElectronAPI(): ElectronAPI | null {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}

function createMockApi(): ElectronAPI {
  const success = <T>(value: T): IpcResult<T> => ({ ok: true, value });

  return {
    invoke: {
      'workspace:list': async () => success([]),
      'workspace:get': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'workspace' } }) as IpcResult<WorkspaceDto>,
      'workspace:getCurrent': async () => success(null),
      'project:list': async () => success([]),
      'project:get': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'project' } }) as IpcResult<ProjectDto>,
      'project:getCurrent': async () => success(null),
      'project:switch': async () => success(undefined),
      'task:list': async () => success([]),
      'task:get': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'task' } }) as IpcResult<TaskDto>,
      'task:create': async (data: CreateTaskDto) =>
        success({
          id: crypto.randomUUID(),
          projectId: data.projectId,
          agentId: data.agentId ?? null,
          title: data.title,
          description: data.description ?? null,
          status: 'pending' as TaskStatus,
          priority: data.priority ?? 0,
          parentId: data.parentId ?? null,
          createdAt: new Date().toISOString(),
          startedAt: null,
          completedAt: null,
          error: null,
        }),
      'task:update': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'task' } }) as IpcResult<TaskDto>,
      'task:cancel': async () => success(undefined),
      'agent:list': async () => success([]),
      'agent:get': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'agent' } }) as IpcResult<AgentDto>,
      'agent:start': async () => success(undefined),
      'agent:stop': async () => success(undefined),
      'agent:pause': async () => success(undefined),
      'agent:resume': async () => success(undefined),
      'event:list': async () => success([]),
      'event:subscribe': async () => success(undefined),
      'event:unsubscribe': async () => success(undefined),
      'approval:list': async () => success([]),
      'approval:get': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'approval' } }) as IpcResult<ApprovalDto>,
      'approval:approve': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'approval' } }) as IpcResult<ApprovalDto>,
      'approval:reject': async () =>
        ({ ok: false, error: { type: 'notFound', message: 'Not found', resource: 'approval' } }) as IpcResult<ApprovalDto>,
      'approval:count': async () => success(0),
      'system:getState': async () =>
        success({
          status: 'idle' as const,
          activeTaskCount: 0,
          pendingApprovals: 0,
          currentProjectId: null,
          currentWorkspaceId: null,
        }),
      'system:quit': async () => success(undefined),
    },
    subscribe: {
      'agent:progress': () => () => {},
      'task:updated': () => () => {},
      'approval:required': () => () => {},
      'approval:updated': () => () => {},
      'event:new': () => () => {},
    },
  };
}

export const electronAPI = getElectronAPI() ?? createMockApi();

export const ipc = {
  workspace: {
    list: () => electronAPI.invoke['workspace:list'](),
    get: (id: string) => electronAPI.invoke['workspace:get'](id),
    getCurrent: () => electronAPI.invoke['workspace:getCurrent'](),
  },

  project: {
    list: (workspaceId?: string) => electronAPI.invoke['project:list'](workspaceId),
    get: (id: string) => electronAPI.invoke['project:get'](id),
    getCurrent: () => electronAPI.invoke['project:getCurrent'](),
    switch: (id: string) => electronAPI.invoke['project:switch'](id),
  },

  task: {
    list: (filter?: TaskFilterDto) => electronAPI.invoke['task:list'](filter),
    get: (id: string) => electronAPI.invoke['task:get'](id),
    create: (data: CreateTaskDto) => electronAPI.invoke['task:create'](data),
    update: (id: string, data: UpdateTaskDto) =>
      electronAPI.invoke['task:update'](id, data),
    cancel: (id: string) => electronAPI.invoke['task:cancel'](id),
  },

  agent: {
    list: () => electronAPI.invoke['agent:list'](),
    get: (id: string) => electronAPI.invoke['agent:get'](id),
    start: (id: string, taskId: string) =>
      electronAPI.invoke['agent:start'](id, taskId),
    stop: (id: string) => electronAPI.invoke['agent:stop'](id),
    pause: (id: string) => electronAPI.invoke['agent:pause'](id),
    resume: (id: string) => electronAPI.invoke['agent:resume'](id),
  },

  event: {
    list: (filter?: EventFilterDto) => electronAPI.invoke['event:list'](filter),
    subscribe: (types?: readonly string[]) =>
      electronAPI.invoke['event:subscribe'](types),
    unsubscribe: () => electronAPI.invoke['event:unsubscribe'](),
  },

  approval: {
    list: (filter?: ApprovalFilterDto) => electronAPI.invoke['approval:list'](filter),
    get: (id: string) => electronAPI.invoke['approval:get'](id),
    approve: (id: string) => electronAPI.invoke['approval:approve'](id),
    reject: (id: string, reason?: string) =>
      electronAPI.invoke['approval:reject'](id, reason),
    count: (projectId?: string) => electronAPI.invoke['approval:count'](projectId),
  },

  system: {
    getState: () => electronAPI.invoke['system:getState'](),
    quit: () => electronAPI.invoke['system:quit'](),
  },

  on: {
    agentProgress: (callback: (payload: AgentProgressPayload) => void) =>
      electronAPI.subscribe['agent:progress'](callback),
    taskUpdated: (callback: (payload: TaskDto) => void) =>
      electronAPI.subscribe['task:updated'](callback),
    approvalRequired: (callback: (payload: ApprovalRequiredPayload) => void) =>
      electronAPI.subscribe['approval:required'](callback),
    approvalUpdated: (callback: (payload: ApprovalDto) => void) =>
      electronAPI.subscribe['approval:updated'](callback),
    eventNew: (callback: (payload: EventDto) => void) =>
      electronAPI.subscribe['event:new'](callback),
  },
};

export type { Result, Failure };
