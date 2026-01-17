/**
 * Claude CLI wrapper types
 */

import type {
  ParsedMessage,
  ResultMessage,
  ToolUseMessage,
  ToolResultMessage,
} from './stream-parser.js';
import type { CancellationToken } from '../shared/cancellation.js';

export interface ClaudeProcessOptions {
  readonly cwd: string;
  readonly systemPrompt: string;
  readonly allowedTools?: readonly string[];
  readonly maxTurns?: number;
  readonly timeout?: number;
  readonly env?: Record<string, string>;
  readonly cancellationToken?: CancellationToken;
  readonly onProgress?: (progress: ClaudeProgress) => void;
}

export interface ClaudeProgress {
  readonly type: 'text' | 'tool_use' | 'tool_result' | 'status';
  readonly message: string;
  readonly toolName?: string;
  readonly timestamp: Date;
  readonly currentTurn?: number;
  readonly maxTurns?: number;
  readonly percent?: number;
}

export interface ClaudeMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: Date;
  readonly toolUses?: readonly ToolUseMessage[];
  readonly toolResults?: readonly ToolResultMessage[];
}

export interface ClaudeProcessResult {
  readonly success: boolean;
  readonly output: string;
  readonly messages: readonly ClaudeMessage[];
  readonly parsedMessages: readonly ParsedMessage[];
  readonly exitCode: number;
  readonly error?: string;
  readonly usage?: ResultMessage['usage'];
  readonly sessionId?: string;
  readonly costUsd?: number;
}

export interface ClaudeCheckResult {
  readonly installed: boolean;
  readonly version?: string;
  readonly authenticated: boolean;
  readonly error?: string;
}

export interface ClaudeProcess {
  send(message: string): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  onOutput(handler: (output: string) => void): void;
  onError(handler: (error: string) => void): void;
  onExit(handler: (code: number) => void): void;
  onMessage(handler: (message: ParsedMessage) => void): void;
  onText(handler: (text: string) => void): void;
  onToolUse(handler: (tool: ToolUseMessage) => void): void;
  getAccumulatedText(): string;
  getParsedMessages(): readonly ParsedMessage[];
}
