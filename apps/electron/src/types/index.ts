/**
 * Electron app types
 */

export * from './dto.js';

export type AppStatus = 'idle' | 'working' | 'attention' | 'error';

export interface AppState {
  readonly status: AppStatus;
  readonly activeTaskCount: number;
  readonly pendingApprovals: number;
  readonly currentProjectId: string | null;
  readonly currentWorkspaceId: string | null;
}
