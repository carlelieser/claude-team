/**
 * Agent system types
 */

import type { CancellationToken } from '../shared/cancellation.js';
import type { ClaudeProgress } from '../claude/types.js';

export type TrustLevel = 'low' | 'medium' | 'high' | 'full';

export interface AgentTrigger {
  readonly event: string;
  readonly action: string;
}

export interface AgentDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly triggers: readonly AgentTrigger[];
  readonly trustLevel: TrustLevel;
  readonly maxTurns: number;
  readonly allowedTools?: readonly string[];
  readonly context?: readonly string[];
  readonly systemPrompt: string;
}

export interface AgentExecutionContext {
  readonly projectId: string;
  readonly workspaceId: string;
  readonly cwd: string;
  readonly taskId?: string;
  readonly eventId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AgentExecutionOptions {
  readonly cancellationToken?: CancellationToken;
  readonly onProgress?: (progress: AgentProgress) => void;
}

export interface AgentProgress {
  readonly agentId: string;
  readonly taskId?: string;
  readonly type: ClaudeProgress['type'];
  readonly message: string;
  readonly toolName?: string;
  readonly currentTurn: number;
  readonly maxTurns: number;
  readonly percent: number;
  readonly timestamp: Date;
}

export interface AgentExecutionResult {
  readonly success: boolean;
  readonly output: string;
  readonly error?: string;
  readonly turnsUsed: number;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly cancelled?: boolean;
}

export interface Agent {
  readonly definition: AgentDefinition;
  execute(
    message: string,
    context: AgentExecutionContext,
    options?: AgentExecutionOptions
  ): Promise<AgentExecutionResult>;
}
