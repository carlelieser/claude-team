/**
 * Parser for Claude CLI stream-json output format
 *
 * The Claude CLI outputs JSON objects, one per line, with different message types:
 * - system: System messages and status updates
 * - assistant: Claude's responses
 * - result: Final result with usage statistics
 * - error: Error messages
 */

import { getLogger } from '../shared/logger.js';

export type StreamMessageType =
  | 'system'
  | 'assistant'
  | 'user'
  | 'result'
  | 'error'
  | 'tool_use'
  | 'tool_result';

export interface StreamMessage {
  readonly type: StreamMessageType;
  readonly timestamp: Date;
}

export interface SystemMessage extends StreamMessage {
  readonly type: 'system';
  readonly subtype: 'init' | 'status' | 'progress' | 'complete';
  readonly message: string;
  readonly data?: Record<string, unknown>;
}

export interface AssistantMessage extends StreamMessage {
  readonly type: 'assistant';
  readonly content: string;
  readonly stopReason?: 'end_turn' | 'max_tokens' | 'tool_use' | 'stop_sequence';
}

export interface UserMessage extends StreamMessage {
  readonly type: 'user';
  readonly content: string;
}

export interface ToolUseMessage extends StreamMessage {
  readonly type: 'tool_use';
  readonly toolId: string;
  readonly toolName: string;
  readonly input: Record<string, unknown>;
}

export interface ToolResultMessage extends StreamMessage {
  readonly type: 'tool_result';
  readonly toolId: string;
  readonly output: string;
  readonly isError: boolean;
}

export interface ResultMessage extends StreamMessage {
  readonly type: 'result';
  readonly success: boolean;
  readonly usage?: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly cacheReadTokens?: number;
    readonly cacheWriteTokens?: number;
  };
  readonly sessionId?: string;
  readonly costUsd?: number;
}

export interface ErrorMessage extends StreamMessage {
  readonly type: 'error';
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export type ParsedMessage =
  | SystemMessage
  | AssistantMessage
  | UserMessage
  | ToolUseMessage
  | ToolResultMessage
  | ResultMessage
  | ErrorMessage;

export interface StreamParserEvents {
  message: (message: ParsedMessage) => void;
  text: (text: string) => void;
  toolUse: (tool: ToolUseMessage) => void;
  toolResult: (result: ToolResultMessage) => void;
  result: (result: ResultMessage) => void;
  error: (error: ErrorMessage) => void;
  parseError: (error: Error, rawLine: string) => void;
}

type EventCallback<T extends keyof StreamParserEvents> = StreamParserEvents[T];

export interface StreamParser {
  parse(data: string): void;
  on<T extends keyof StreamParserEvents>(event: T, callback: EventCallback<T>): void;
  off<T extends keyof StreamParserEvents>(event: T, callback: EventCallback<T>): void;
  getMessages(): readonly ParsedMessage[];
  getText(): string;
  reset(): void;
}

class DefaultStreamParser implements StreamParser {
  private readonly _logger = getLogger().child({ component: 'StreamParser' });
  private readonly _messages: ParsedMessage[] = [];
  private readonly _listeners = new Map<keyof StreamParserEvents, Set<Function>>();
  private _buffer = '';
  private _accumulatedText = '';

  parse(data: string): void {
    this._buffer += data;

    const lines = this._buffer.split('\n');
    this._buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        continue;
      }

      this._parseLine(trimmedLine);
    }
  }

  on<T extends keyof StreamParserEvents>(event: T, callback: EventCallback<T>): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(callback);
  }

  off<T extends keyof StreamParserEvents>(event: T, callback: EventCallback<T>): void {
    this._listeners.get(event)?.delete(callback);
  }

  getMessages(): readonly ParsedMessage[] {
    return [...this._messages];
  }

  getText(): string {
    return this._accumulatedText;
  }

  reset(): void {
    this._messages.length = 0;
    this._buffer = '';
    this._accumulatedText = '';
  }

  private _emit<T extends keyof StreamParserEvents>(
    event: T,
    ...args: Parameters<StreamParserEvents[T]>
  ): void {
    const listeners = this._listeners.get(event);
    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        this._logger.error('Event listener error', {
          event,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private _parseLine(line: string): void {
    try {
      const json = JSON.parse(line) as Record<string, unknown>;
      const message = this._parseJsonMessage(json);

      if (message) {
        this._messages.push(message);
        this._emit('message', message);

        this._emitTypedEvent(message);
      }
    } catch (error) {
      const parseError = error instanceof Error ? error : new Error(String(error));
      this._logger.warn('Failed to parse stream line', {
        line: line.slice(0, 100),
        error: parseError.message,
      });
      this._emit('parseError', parseError, line);
    }
  }

  private _parseJsonMessage(json: Record<string, unknown>): ParsedMessage | undefined {
    const type = json['type'] as string | undefined;
    const timestamp = new Date();

    switch (type) {
      case 'system':
        return this._parseSystemMessage(json, timestamp);
      case 'assistant':
        return this._parseAssistantMessage(json, timestamp);
      case 'user':
        return this._parseUserMessage(json, timestamp);
      case 'tool_use':
        return this._parseToolUseMessage(json, timestamp);
      case 'tool_result':
        return this._parseToolResultMessage(json, timestamp);
      case 'result':
        return this._parseResultMessage(json, timestamp);
      case 'error':
        return this._parseErrorMessage(json, timestamp);
      default:
        this._logger.debug('Unknown message type', { type, json });
        return undefined;
    }
  }

  private _parseSystemMessage(
    json: Record<string, unknown>,
    timestamp: Date
  ): SystemMessage {
    return {
      type: 'system',
      subtype: (json['subtype'] as SystemMessage['subtype']) || 'status',
      message: String(json['message'] || ''),
      data: json['data'] as Record<string, unknown> | undefined,
      timestamp,
    };
  }

  private _parseAssistantMessage(
    json: Record<string, unknown>,
    timestamp: Date
  ): AssistantMessage {
    const content = String(json['content'] || json['text'] || '');
    this._accumulatedText += content;

    return {
      type: 'assistant',
      content,
      stopReason: json['stop_reason'] as AssistantMessage['stopReason'],
      timestamp,
    };
  }

  private _parseUserMessage(
    json: Record<string, unknown>,
    timestamp: Date
  ): UserMessage {
    return {
      type: 'user',
      content: String(json['content'] || json['text'] || ''),
      timestamp,
    };
  }

  private _parseToolUseMessage(
    json: Record<string, unknown>,
    timestamp: Date
  ): ToolUseMessage {
    return {
      type: 'tool_use',
      toolId: String(json['id'] || json['tool_id'] || ''),
      toolName: String(json['name'] || json['tool_name'] || ''),
      input: (json['input'] as Record<string, unknown>) || {},
      timestamp,
    };
  }

  private _parseToolResultMessage(
    json: Record<string, unknown>,
    timestamp: Date
  ): ToolResultMessage {
    return {
      type: 'tool_result',
      toolId: String(json['tool_use_id'] || json['tool_id'] || ''),
      output: String(json['output'] || json['content'] || ''),
      isError: Boolean(json['is_error'] || json['isError']),
      timestamp,
    };
  }

  private _parseResultMessage(
    json: Record<string, unknown>,
    timestamp: Date
  ): ResultMessage {
    const usage = json['usage'] as Record<string, unknown> | undefined;

    return {
      type: 'result',
      success: Boolean(json['success'] ?? true),
      sessionId: json['session_id'] as string | undefined,
      costUsd: json['cost_usd'] as number | undefined,
      usage: usage
        ? {
            inputTokens: Number(usage['input_tokens'] || 0),
            outputTokens: Number(usage['output_tokens'] || 0),
            cacheReadTokens: usage['cache_read_tokens'] as number | undefined,
            cacheWriteTokens: usage['cache_write_tokens'] as number | undefined,
          }
        : undefined,
      timestamp,
    };
  }

  private _parseErrorMessage(
    json: Record<string, unknown>,
    timestamp: Date
  ): ErrorMessage {
    return {
      type: 'error',
      code: String(json['code'] || json['error_code'] || 'unknown'),
      message: String(json['message'] || json['error'] || 'Unknown error'),
      details: json['details'] as Record<string, unknown> | undefined,
      timestamp,
    };
  }

  private _emitTypedEvent(message: ParsedMessage): void {
    switch (message.type) {
      case 'assistant':
        this._emit('text', message.content);
        break;
      case 'tool_use':
        this._emit('toolUse', message);
        break;
      case 'tool_result':
        this._emit('toolResult', message);
        break;
      case 'result':
        this._emit('result', message);
        break;
      case 'error':
        this._emit('error', message);
        break;
    }
  }
}

export function createStreamParser(): StreamParser {
  return new DefaultStreamParser();
}
