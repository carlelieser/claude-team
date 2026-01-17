/**
 * Load agent definitions from a directory of markdown files
 */

import { readdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, success } from '../shared/result.js';
import { loadAgentFromFile } from './agent-loader.js';
import type { AgentOrchestrator } from './agent-orchestrator.js';
import type { AgentDefinition } from './types.js';

export interface LoadDirectoryResult {
  readonly loaded: readonly AgentDefinition[];
  readonly failed: readonly {
    readonly path: string;
    readonly error: string;
  }[];
}

export interface AgentDirectoryLoaderOptions {
  readonly extensions?: readonly string[];
  readonly recursive?: boolean;
}

const DEFAULT_EXTENSIONS = ['.md', '.markdown'];

/**
 * Load all agent definitions from a directory
 */
export async function loadAgentsFromDirectory(
  directoryPath: string,
  options: AgentDirectoryLoaderOptions = {}
): Promise<Result<LoadDirectoryResult>> {
  const logger = getLogger().child({ component: 'AgentDirectoryLoader' });
  const extensions = options.extensions || DEFAULT_EXTENSIONS;

  logger.info('Loading agents from directory', {
    directoryPath,
    extensions,
  });

  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    const loaded: AgentDefinition[] = [];
    const failed: { path: string; error: string }[] = [];

    const filesToLoad: string[] = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          filesToLoad.push(join(directoryPath, entry.name));
        }
      } else if (entry.isDirectory() && options.recursive) {
        const subDirPath = join(directoryPath, entry.name);
        const subResult = await loadAgentsFromDirectory(subDirPath, options);

        if (subResult.ok) {
          loaded.push(...subResult.value.loaded);
          failed.push(...subResult.value.failed);
        }
      }
    }

    const loadResults = await Promise.all(
      filesToLoad.map(async (filePath) => {
        const result = await loadAgentFromFile(filePath);
        return { filePath, result };
      })
    );

    for (const { filePath, result } of loadResults) {
      if (result.ok) {
        loaded.push(result.value);

        logger.info('Agent loaded', {
          agentId: result.value.id,
          agentName: result.value.name,
          filePath,
        });
      } else {
        failed.push({
          path: filePath,
          error: result.error.message,
        });

        logger.warn('Failed to load agent', {
          filePath,
          error: result.error.message,
        });
      }
    }

    logger.info('Directory loading complete', {
      directoryPath,
      loadedCount: loaded.length,
      failedCount: failed.length,
    });

    return success({ loaded, failed });
  } catch (error) {
    logger.error('Failed to read directory', {
      directoryPath,
      error: error instanceof Error ? error.message : String(error),
    });

    return failure({
      type: 'unknown',
      message: `Failed to read directory: ${directoryPath}`,
      cause: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Load agents from a directory and register them with an orchestrator
 */
export async function loadAndRegisterAgents(
  directoryPath: string,
  orchestrator: AgentOrchestrator,
  options: AgentDirectoryLoaderOptions = {}
): Promise<Result<LoadDirectoryResult>> {
  const logger = getLogger().child({ component: 'AgentDirectoryLoader' });

  const loadResult = await loadAgentsFromDirectory(directoryPath, options);

  if (!loadResult.ok) {
    return loadResult;
  }

  const { loaded, failed } = loadResult.value;

  for (const agent of loaded) {
    orchestrator.registerAgent(agent);

    logger.info('Agent registered', {
      agentId: agent.id,
      agentName: agent.name,
    });
  }

  return success({ loaded, failed });
}

/**
 * Get the default agents directory path
 */
export function getDefaultAgentsDirectory(projectRoot: string): string {
  return join(projectRoot, 'agents');
}

/**
 * List agent files in a directory without loading them
 */
export async function listAgentFiles(
  directoryPath: string,
  options: AgentDirectoryLoaderOptions = {}
): Promise<Result<readonly string[]>> {
  const logger = getLogger().child({ component: 'AgentDirectoryLoader' });
  const extensions = options.extensions || DEFAULT_EXTENSIONS;

  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(join(directoryPath, entry.name));
        }
      } else if (entry.isDirectory() && options.recursive) {
        const subDirPath = join(directoryPath, entry.name);
        const subResult = await listAgentFiles(subDirPath, options);

        if (subResult.ok) {
          files.push(...subResult.value);
        }
      }
    }

    logger.debug('Listed agent files', {
      directoryPath,
      count: files.length,
    });

    return success(files);
  } catch (error) {
    logger.error('Failed to list agent files', {
      directoryPath,
      error: error instanceof Error ? error.message : String(error),
    });

    return failure({
      type: 'unknown',
      message: `Failed to list agent files in: ${directoryPath}`,
      cause: error instanceof Error ? error.stack : undefined,
    });
  }
}

/**
 * Get agent ID from a file name (without extension)
 */
export function getAgentIdFromFileName(fileName: string): string {
  return basename(fileName, extname(fileName));
}
