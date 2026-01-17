/**
 * Shared types used across the core package
 */

export type Failure =
  | {
      type: 'network' | 'timeout' | 'unknown';
      message: string;
      cause?: string;
    }
  | {
      type: 'server';
      message: string;
      statusCode: number;
    }
  | {
      type: 'validation';
      message: string;
      fields: Record<string, string>;
    }
  | {
      type: 'notFound';
      message: string;
      resource: string;
    }
  | {
      type: 'unauthorized' | 'forbidden';
      message: string;
    };

export interface ProjectContext {
  readonly projectId: string;
  readonly workspaceId: string;
  readonly cwd: string;
}
