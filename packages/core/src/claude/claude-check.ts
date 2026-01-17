/**
 * Verify Claude CLI installation and authentication
 */

import { spawn } from 'node:child_process';
import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { fromPromise, success } from '../shared/result.js';
import type { ClaudeCheckResult } from './types.js';

const CLAUDE_CLI_COMMAND = 'claude';
const VERSION_TIMEOUT = 5000;

/**
 * Check if Claude CLI is installed and authenticated
 */
export async function checkClaudeCli(): Promise<Result<ClaudeCheckResult>> {
  const logger = getLogger().child({ component: 'ClaudeCheck' });

  logger.debug('Checking Claude CLI installation');

  const versionResult = await checkVersion();
  if (!versionResult.ok) {
    logger.error('Claude CLI not found', { error: versionResult.error });
    return success({
      installed: false,
      authenticated: false,
      error: 'Claude CLI not found in PATH',
    });
  }

  const version = versionResult.value;
  logger.info('Claude CLI found', { version });

  const authResult = await checkAuthentication();
  if (!authResult.ok) {
    logger.warn('Claude CLI authentication check failed', {
      error: authResult.error,
    });
    return success({
      installed: true,
      version,
      authenticated: false,
      error: 'Authentication check failed',
    });
  }

  const authenticated = authResult.value;
  logger.info('Claude CLI authentication status', { authenticated });

  return success({
    installed: true,
    version,
    authenticated,
  });
}

/**
 * Check Claude CLI version
 */
async function checkVersion(): Promise<Result<string>> {
  return fromPromise(
    new Promise<string>((resolve, reject) => {
      const process = spawn(CLAUDE_CLI_COMMAND, ['--version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          const version = output.trim() || 'unknown';
          resolve(version);
        } else {
          reject(
            new Error(
              `Version check failed with code ${code}: ${errorOutput}`
            )
          );
        }
      });

      process.on('error', (error) => {
        reject(error);
      });

      setTimeout(() => {
        process.kill();
        reject(new Error('Version check timed out'));
      }, VERSION_TIMEOUT);
    })
  );
}

/**
 * Check Claude CLI authentication status
 * Attempts to run a simple command to verify authentication
 */
async function checkAuthentication(): Promise<Result<boolean>> {
  return fromPromise(
    new Promise<boolean>((resolve, reject) => {
      const process = spawn(CLAUDE_CLI_COMMAND, ['--help'], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let errorOutput = '';

      process.stderr.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          const notAuthenticated =
            errorOutput.toLowerCase().includes('not authenticated') ||
            errorOutput.toLowerCase().includes('login') ||
            errorOutput.toLowerCase().includes('auth');
          resolve(!notAuthenticated);
        } else {
          const notAuthenticated =
            errorOutput.toLowerCase().includes('not authenticated') ||
            errorOutput.toLowerCase().includes('login') ||
            errorOutput.toLowerCase().includes('auth');
          resolve(!notAuthenticated);
        }
      });

      process.on('error', (error) => {
        reject(error);
      });

      setTimeout(() => {
        process.kill();
        reject(new Error('Authentication check timed out'));
      }, VERSION_TIMEOUT);
    })
  );
}

/**
 * Get the Claude CLI command path
 */
export function getClaudeCliCommand(): string {
  return CLAUDE_CLI_COMMAND;
}
