/**
 * Logger service using pino for structured logging
 * MUST use this instead of console.log
 */

import pino from 'pino';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface Logger {
  error(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

class PinoLogger implements Logger {
  constructor(private readonly _logger: pino.Logger) {}

  error(message: string, metadata?: Record<string, unknown>): void {
    this._logger.error(metadata, message);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this._logger.warn(metadata, message);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this._logger.info(metadata, message);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this._logger.debug(metadata, message);
  }

  child(bindings: Record<string, unknown>): Logger {
    return new PinoLogger(this._logger.child(bindings));
  }
}

export interface LoggerOptions {
  readonly level?: LogLevel;
  readonly prettyPrint?: boolean;
  readonly name?: string;
}

/**
 * Create a logger instance
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const { level = 'info', prettyPrint = false, name = 'claude-team' } = options;

  const pinoLogger = pino({
    name,
    level,
    transport: prettyPrint
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  });

  return new PinoLogger(pinoLogger);
}

let defaultLogger: Logger | undefined;

/**
 * Get or create the default logger instance
 */
export function getLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger({
      level: (process.env['LOG_LEVEL'] as LogLevel) || 'info',
      prettyPrint: process.env['NODE_ENV'] !== 'production',
    });
  }
  return defaultLogger;
}

/**
 * Set the default logger instance
 */
export function setLogger(logger: Logger): void {
  defaultLogger = logger;
}
