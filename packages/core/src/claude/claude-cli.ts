/**
 * High-level Claude CLI wrapper
 */

import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, success } from '../shared/result.js';
import { checkClaudeCli } from './claude-check.js';
import { createClaudeProcess, DefaultClaudeProcess } from './claude-process.js';
import type { ResultMessage, ToolResultMessage, ToolUseMessage } from './stream-parser.js';
import type {
  ClaudeMessage,
  ClaudeProcess,
  ClaudeProcessOptions,
  ClaudeProcessResult,
} from './types.js';

export interface ClaudeCli {
  check(): Promise<Result<boolean>>;
  execute(
    userMessage: string,
    options: ClaudeProcessOptions
  ): Promise<Result<ClaudeProcessResult>>;
  spawn(options: ClaudeProcessOptions): Result<ClaudeProcess>;
}

class DefaultClaudeCli implements ClaudeCli {
  private readonly _logger = getLogger().child({ component: 'ClaudeCli' });

  async check(): Promise<Result<boolean>> {
    this._logger.debug('Checking Claude CLI');

    const result = await checkClaudeCli();
    if (!result.ok) {
      return failure(result.error);
    }

    const checkResult = result.value;

    if (!checkResult.installed) {
      return failure({
        type: 'notFound',
        message: 'Claude CLI is not installed',
        resource: 'claude-cli',
      });
    }

    if (!checkResult.authenticated) {
      return failure({
        type: 'unauthorized',
        message: 'Claude CLI is not authenticated. Please run: claude auth',
      });
    }

    this._logger.info('Claude CLI check passed', {
      version: checkResult.version,
    });

    return success(true);
  }

  async execute(
    userMessage: string,
    options: ClaudeProcessOptions
  ): Promise<Result<ClaudeProcessResult>> {
    this._logger.info('Executing Claude CLI', {
      cwd: options.cwd,
      messageLength: userMessage.length,
    });

    const checkResult = await this.check();
    if (!checkResult.ok) {
      return failure(checkResult.error);
    }

    const processResult = createClaudeProcess(options);
    if (!processResult.ok) {
      return failure(processResult.error);
    }

    const process = processResult.value as DefaultClaudeProcess;
    let errorOutput = '';
    let exitCode = 0;
    let resultMessage: ResultMessage | undefined;

    return new Promise((resolve) => {
      process.onError((data) => {
        errorOutput += data;
      });

      process.onMessage((message) => {
        if (message.type === 'result') {
          resultMessage = message;
        }
      });

      process.onExit((code) => {
        exitCode = code;

        const parsedMessages = process.getParsedMessages();
        const accumulatedText = process.getAccumulatedText();

        const messages = this._buildMessages(userMessage, parsedMessages);

        const result: ClaudeProcessResult = {
          success: exitCode === 0 && !errorOutput,
          output: accumulatedText,
          messages,
          parsedMessages,
          exitCode,
          error: errorOutput || undefined,
          usage: resultMessage?.usage,
          sessionId: resultMessage?.sessionId,
          costUsd: resultMessage?.costUsd,
        };

        this._logger.info('Claude CLI execution completed', {
          success: result.success,
          exitCode,
          outputLength: accumulatedText.length,
          messageCount: parsedMessages.length,
          usage: result.usage,
        });

        resolve(success(result));
      });

      process
        .send(userMessage)
        .then(() => {
          this._logger.debug('Message sent to Claude process');
        })
        .catch((error) => {
          this._logger.error('Failed to send message', {
            error: error instanceof Error ? error.message : String(error),
          });

          resolve(
            failure({
              type: 'unknown',
              message: 'Failed to send message to Claude process',
              cause: error instanceof Error ? error : undefined,
            })
          );
        });

      if (options.timeout) {
        setTimeout(() => {
          process.stop().catch((error) => {
            this._logger.error('Failed to stop process on timeout', {
              error: error instanceof Error ? error.message : String(error),
            });
          });

          resolve(
            failure({
              type: 'timeout',
              message: 'Claude CLI execution timed out',
            })
          );
        }, options.timeout);
      }
    });
  }

  spawn(options: ClaudeProcessOptions): Result<ClaudeProcess> {
    this._logger.info('Spawning Claude process', {
      cwd: options.cwd,
      maxTurns: options.maxTurns,
    });

    return createClaudeProcess(options);
  }

  private _buildMessages(
    userMessage: string,
    parsedMessages: readonly import('./stream-parser.js').ParsedMessage[]
  ): ClaudeMessage[] {
    const messages: ClaudeMessage[] = [];

    messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    let currentAssistantContent = '';
    const currentToolUses: ToolUseMessage[] = [];
    const currentToolResults: ToolResultMessage[] = [];

    for (const msg of parsedMessages) {
      switch (msg.type) {
        case 'assistant':
          currentAssistantContent += msg.content;
          break;

        case 'tool_use':
          currentToolUses.push(msg);
          break;

        case 'tool_result':
          currentToolResults.push(msg);
          break;

        case 'user':
          if (currentAssistantContent || currentToolUses.length > 0) {
            messages.push({
              role: 'assistant',
              content: currentAssistantContent,
              timestamp: msg.timestamp,
              toolUses: currentToolUses.length > 0 ? [...currentToolUses] : undefined,
              toolResults: currentToolResults.length > 0 ? [...currentToolResults] : undefined,
            });
            currentAssistantContent = '';
            currentToolUses.length = 0;
            currentToolResults.length = 0;
          }

          messages.push({
            role: 'user',
            content: msg.content,
            timestamp: msg.timestamp,
          });
          break;
      }
    }

    if (currentAssistantContent || currentToolUses.length > 0) {
      messages.push({
        role: 'assistant',
        content: currentAssistantContent,
        timestamp: new Date(),
        toolUses: currentToolUses.length > 0 ? [...currentToolUses] : undefined,
        toolResults: currentToolResults.length > 0 ? [...currentToolResults] : undefined,
      });
    }

    return messages;
  }
}

let defaultClaudeCli: ClaudeCli | undefined;

export function createClaudeCli(): ClaudeCli {
  return new DefaultClaudeCli();
}

export function getClaudeCli(): ClaudeCli {
  if (!defaultClaudeCli) {
    defaultClaudeCli = createClaudeCli();
  }
  return defaultClaudeCli;
}

export function setClaudeCli(cli: ClaudeCli): void {
  defaultClaudeCli = cli;
}
