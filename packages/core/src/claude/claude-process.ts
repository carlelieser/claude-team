/**
 * Claude CLI process management with stream parsing
 */

import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, success } from '../shared/result.js';
import { getClaudeCliCommand } from './claude-check.js';
import {
  createStreamParser,
  type ParsedMessage,
  type StreamParser,
  type ToolUseMessage,
} from './stream-parser.js';
import type { ClaudeProcess, ClaudeProcessOptions } from './types.js';

const DEFAULT_TIMEOUT = 300000;
const DEFAULT_MAX_TURNS = 10;
const GRACEFUL_SHUTDOWN_TIMEOUT = 5000;

type OutputHandler = (output: string) => void;
type ErrorHandler = (error: string) => void;
type ExitHandler = (code: number) => void;
type MessageHandler = (message: ParsedMessage) => void;
type TextHandler = (text: string) => void;
type ToolUseHandler = (tool: ToolUseMessage) => void;

export class DefaultClaudeProcess implements ClaudeProcess {
  private _process?: ChildProcess;
  private readonly _options: ClaudeProcessOptions;
  private readonly _logger = getLogger().child({ component: 'ClaudeProcess' });
  private readonly _outputHandlers: OutputHandler[] = [];
  private readonly _errorHandlers: ErrorHandler[] = [];
  private readonly _exitHandlers: ExitHandler[] = [];
  private readonly _messageHandlers: MessageHandler[] = [];
  private readonly _textHandlers: TextHandler[] = [];
  private readonly _toolUseHandlers: ToolUseHandler[] = [];
  private readonly _streamParser: StreamParser;
  private _running = false;
  private _started = false;
  private _exitPromise?: Promise<void>;
  private _exitResolve?: () => void;
  private _currentTurn = 0;
  private _cancellationUnregister?: () => void;

  constructor(options: ClaudeProcessOptions) {
    this._options = {
      ...options,
      timeout: options.timeout || DEFAULT_TIMEOUT,
      maxTurns: options.maxTurns || DEFAULT_MAX_TURNS,
    };

    this._streamParser = createStreamParser();
    this._setupStreamParserListeners();
    this._setupCancellationListener();
  }

  private _setupCancellationListener(): void {
    if (this._options.cancellationToken) {
      this._cancellationUnregister = this._options.cancellationToken.register(() => {
        this._logger.info('Cancellation requested, stopping process');
        this.stop().catch((error) => {
          this._logger.error('Failed to stop process on cancellation', {
            error: error instanceof Error ? error.message : String(error),
          });
        });
      });
    }
  }

  async send(message: string): Promise<void> {
    if (!this._started) {
      await this._start(message);
      return;
    }

    if (!this._running) {
      throw new Error('Claude process is not running');
    }

    if (!this._process || !this._process.stdin) {
      throw new Error('Claude process stdin not available');
    }

    this._logger.debug('Sending follow-up message to Claude', {
      messageLength: message.length,
    });

    return new Promise((resolve, reject) => {
      if (!this._process || !this._process.stdin) {
        reject(new Error('Process stdin not available'));
        return;
      }

      this._process.stdin.write(message + '\n', (error) => {
        if (error) {
          this._logger.error('Failed to write to stdin', {
            error: error.message,
          });
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async stop(): Promise<void> {
    if (!this._running || !this._process) {
      this._logger.debug('Claude process already stopped');
      return;
    }

    this._logger.info('Stopping Claude process');

    if (this._cancellationUnregister) {
      this._cancellationUnregister();
      this._cancellationUnregister = undefined;
    }

    return new Promise((resolve) => {
      if (!this._process) {
        resolve();
        return;
      }

      const cleanup = () => {
        this._running = false;
        this._process = undefined;
        this._logger.info('Claude process stopped');
        resolve();
      };

      this._process.once('exit', cleanup);

      this._process.kill('SIGTERM');

      setTimeout(() => {
        if (this._process && this._running) {
          this._logger.warn('Force killing Claude process after timeout');
          this._process.kill('SIGKILL');
          cleanup();
        }
      }, GRACEFUL_SHUTDOWN_TIMEOUT);
    });
  }

  isRunning(): boolean {
    return this._running;
  }

  onOutput(handler: OutputHandler): void {
    this._outputHandlers.push(handler);
  }

  onError(handler: ErrorHandler): void {
    this._errorHandlers.push(handler);
  }

  onExit(handler: ExitHandler): void {
    this._exitHandlers.push(handler);
  }

  onMessage(handler: MessageHandler): void {
    this._messageHandlers.push(handler);
  }

  onText(handler: TextHandler): void {
    this._textHandlers.push(handler);
  }

  onToolUse(handler: ToolUseHandler): void {
    this._toolUseHandlers.push(handler);
  }

  getAccumulatedText(): string {
    return this._streamParser.getText();
  }

  getParsedMessages(): readonly ParsedMessage[] {
    return this._streamParser.getMessages();
  }

  waitForExit(): Promise<void> {
    if (!this._exitPromise) {
      this._exitPromise = new Promise((resolve) => {
        this._exitResolve = resolve;
      });
    }
    return this._exitPromise;
  }

  private _setupStreamParserListeners(): void {
    this._streamParser.on('message', (message) => {
      for (const handler of this._messageHandlers) {
        this._safeCall(() => handler(message), 'message handler');
      }

      if (this._options.onProgress) {
        this._emitProgress(message);
      }
    });

    this._streamParser.on('text', (text) => {
      for (const handler of this._textHandlers) {
        this._safeCall(() => handler(text), 'text handler');
      }
    });

    this._streamParser.on('toolUse', (tool) => {
      for (const handler of this._toolUseHandlers) {
        this._safeCall(() => handler(tool), 'tool use handler');
      }
    });

    this._streamParser.on('error', (error) => {
      this._logger.warn('Stream error received', {
        code: error.code,
        message: error.message,
      });
    });

    this._streamParser.on('parseError', (error, rawLine) => {
      this._logger.debug('Stream parse error', {
        error: error.message,
        line: rawLine.slice(0, 100),
      });
    });
  }

  private _emitProgress(message: ParsedMessage): void {
    if (!this._options.onProgress) {
      return;
    }

    const maxTurns = this._options.maxTurns ?? DEFAULT_MAX_TURNS;
    const currentTurn = this._currentTurn;
    const percent = maxTurns > 0 ? Math.min(100, Math.round((currentTurn / maxTurns) * 100)) : 0;

    switch (message.type) {
      case 'assistant':
        this._currentTurn++;
        this._options.onProgress({
          type: 'text',
          message: message.content,
          timestamp: message.timestamp,
          currentTurn: this._currentTurn,
          maxTurns,
          percent: maxTurns > 0 ? Math.min(100, Math.round((this._currentTurn / maxTurns) * 100)) : 0,
        });
        break;

      case 'tool_use':
        this._options.onProgress({
          type: 'tool_use',
          message: `Using tool: ${message.toolName}`,
          toolName: message.toolName,
          timestamp: message.timestamp,
          currentTurn,
          maxTurns,
          percent,
        });
        break;

      case 'tool_result':
        this._options.onProgress({
          type: 'tool_result',
          message: message.isError ? 'Tool error' : 'Tool completed',
          timestamp: message.timestamp,
          currentTurn,
          maxTurns,
          percent,
        });
        break;

      case 'system':
        this._options.onProgress({
          type: 'status',
          message: message.message,
          timestamp: message.timestamp,
          currentTurn,
          maxTurns,
          percent,
        });
        break;
    }
  }

  getCurrentTurn(): number {
    return this._currentTurn;
  }

  private async _start(initialMessage: string): Promise<void> {
    if (this._started) {
      this._logger.warn('Claude process already started');
      return;
    }

    const args = this._buildArgs(initialMessage);

    this._logger.info('Starting Claude process', {
      cwd: this._options.cwd,
      maxTurns: this._options.maxTurns,
      allowedTools: this._options.allowedTools?.length || 'all',
      messageLength: initialMessage.length,
    });

    this._process = spawn(getClaudeCliCommand(), args, {
      cwd: this._options.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...this._options.env,
      },
    });

    this._started = true;
    this._running = true;

    this._setupProcessHandlers();
    this._setupTimeout();
  }

  private _buildArgs(message: string): string[] {
    const args: string[] = ['--print', '--output-format', 'stream-json'];

    if (this._options.systemPrompt) {
      args.push('--system-prompt', this._options.systemPrompt);
    }

    if (this._options.maxTurns !== undefined) {
      args.push('--max-turns', String(this._options.maxTurns));
    }

    if (this._options.allowedTools && this._options.allowedTools.length > 0) {
      args.push('--allowedTools', this._options.allowedTools.join(','));
    }

    args.push('--', message);

    return args;
  }

  private _setupProcessHandlers(): void {
    if (!this._process) {
      return;
    }

    this._process.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      this._logger.debug('Claude stdout', { outputLength: output.length });

      this._streamParser.parse(output);

      for (const handler of this._outputHandlers) {
        this._safeCall(() => handler(output), 'output handler');
      }
    });

    this._process.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      this._logger.warn('Claude stderr', { error: error.slice(0, 200) });

      for (const handler of this._errorHandlers) {
        this._safeCall(() => handler(error), 'error handler');
      }
    });

    this._process.on('exit', (code) => {
      const exitCode = code ?? 0;
      this._logger.info('Claude process exited', { exitCode });
      this._running = false;

      for (const handler of this._exitHandlers) {
        this._safeCall(() => handler(exitCode), 'exit handler');
      }

      if (this._exitResolve) {
        this._exitResolve();
      }
    });

    this._process.on('error', (error) => {
      this._logger.error('Claude process error', { error: error.message });
      this._running = false;

      for (const handler of this._errorHandlers) {
        this._safeCall(() => handler(error.message), 'error handler');
      }
    });
  }

  private _setupTimeout(): void {
    if (!this._options.timeout) {
      return;
    }

    setTimeout(() => {
      if (this._running) {
        this._logger.warn('Claude process timeout, stopping', {
          timeout: this._options.timeout,
        });
        this.stop().catch((error) => {
          this._logger.error('Failed to stop process on timeout', {
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
    }, this._options.timeout);
  }

  private _safeCall(fn: () => void, context: string): void {
    try {
      fn();
    } catch (error) {
      this._logger.error(`${context} error`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export function createClaudeProcess(
  options: ClaudeProcessOptions
): Result<ClaudeProcess> {
  try {
    const process = new DefaultClaudeProcess(options);
    return success(process);
  } catch (error) {
    return failure({
      type: 'unknown',
      message:
        error instanceof Error ? error.message : 'Failed to create process',
      cause: error instanceof Error ? error : undefined,
    });
  }
}
