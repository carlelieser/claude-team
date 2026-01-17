/**
 * Load agent definitions from markdown files with YAML frontmatter
 */

import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, fromPromise, success } from '../shared/result.js';
import type { AgentDefinition, AgentTrigger, TrustLevel } from './types.js';

interface AgentFrontmatter {
  id: string;
  name: string;
  description: string;
  triggers: Array<{ event: string; action: string }>;
  trustLevel: TrustLevel;
  maxTurns: number;
  allowedTools?: string[];
  context?: string[];
}

/**
 * Load an agent definition from a markdown file
 */
export async function loadAgentFromFile(
  filePath: string
): Promise<Result<AgentDefinition>> {
  const logger = getLogger().child({ component: 'AgentLoader' });

  logger.debug('Loading agent from file', { filePath });

  const fileResult = await fromPromise(readFile(filePath, 'utf-8'));

  if (!fileResult.ok) {
    logger.error('Failed to read agent file', {
      filePath,
      error: fileResult.error,
    });
    return failure(fileResult.error);
  }

  const content = fileResult.value;
  const parseResult = parseAgentMarkdown(content);

  if (!parseResult.ok) {
    logger.error('Failed to parse agent markdown', {
      filePath,
      error: parseResult.error,
    });
    return failure(parseResult.error);
  }

  logger.info('Agent loaded successfully', {
    filePath,
    agentId: parseResult.value.id,
    agentName: parseResult.value.name,
  });

  return parseResult;
}

/**
 * Parse agent definition from markdown content
 */
export function parseAgentMarkdown(
  content: string
): Result<AgentDefinition> {
  try {
    const parsed = matter(content);
    const frontmatter = parsed.data as Partial<AgentFrontmatter>;
    const systemPrompt = parsed.content.trim();

    const validationResult = validateAgentFrontmatter(frontmatter);
    if (!validationResult.ok) {
      return failure(validationResult.error);
    }

    const validatedFrontmatter = validationResult.value;

    const definition: AgentDefinition = {
      id: validatedFrontmatter.id,
      name: validatedFrontmatter.name,
      description: validatedFrontmatter.description,
      triggers: validatedFrontmatter.triggers.map(
        (t): AgentTrigger => ({
          event: t.event,
          action: t.action,
        })
      ),
      trustLevel: validatedFrontmatter.trustLevel,
      maxTurns: validatedFrontmatter.maxTurns,
      allowedTools: validatedFrontmatter.allowedTools,
      context: validatedFrontmatter.context,
      systemPrompt,
    };

    return success(definition);
  } catch (error) {
    return failure({
      type: 'validation',
      message:
        error instanceof Error
          ? error.message
          : 'Failed to parse agent markdown',
      fields: {},
    });
  }
}

/**
 * Validate agent frontmatter
 */
function validateAgentFrontmatter(
  frontmatter: Partial<AgentFrontmatter>
): Result<AgentFrontmatter> {
  const errors: Record<string, string> = {};

  if (!frontmatter.id) {
    errors['id'] = 'Agent ID is required';
  }

  if (!frontmatter.name) {
    errors['name'] = 'Agent name is required';
  }

  if (!frontmatter.description) {
    errors['description'] = 'Agent description is required';
  }

  if (!frontmatter.triggers || !Array.isArray(frontmatter.triggers)) {
    errors['triggers'] = 'Agent triggers must be an array';
  } else {
    for (let i = 0; i < frontmatter.triggers.length; i++) {
      const trigger = frontmatter.triggers[i];
      if (!trigger) {
        continue;
      }

      if (!trigger.event) {
        errors[`triggers[${i}].event`] = 'Trigger event is required';
      }
      if (!trigger.action) {
        errors[`triggers[${i}].action`] = 'Trigger action is required';
      }
    }
  }

  if (!frontmatter.trustLevel) {
    errors['trustLevel'] = 'Trust level is required';
  } else if (
    !['low', 'medium', 'high', 'full'].includes(frontmatter.trustLevel)
  ) {
    errors['trustLevel'] = 'Trust level must be low, medium, high, or full';
  }

  if (frontmatter.maxTurns === undefined) {
    errors['maxTurns'] = 'Max turns is required';
  } else if (
    typeof frontmatter.maxTurns !== 'number' ||
    frontmatter.maxTurns < 1
  ) {
    errors['maxTurns'] = 'Max turns must be a positive number';
  }

  if (frontmatter.allowedTools && !Array.isArray(frontmatter.allowedTools)) {
    errors['allowedTools'] = 'Allowed tools must be an array';
  }

  if (frontmatter.context && !Array.isArray(frontmatter.context)) {
    errors['context'] = 'Context must be an array';
  }

  if (Object.keys(errors).length > 0) {
    return failure({
      type: 'validation',
      message: 'Invalid agent frontmatter',
      fields: errors,
    });
  }

  return success(frontmatter as AgentFrontmatter);
}

/**
 * Load multiple agents from file paths
 */
export async function loadAgentsFromFiles(
  filePaths: readonly string[]
): Promise<Result<readonly AgentDefinition[]>> {
  const logger = getLogger().child({ component: 'AgentLoader' });

  logger.info('Loading agents from files', { count: filePaths.length });

  const results = await Promise.all(
    filePaths.map((path) => loadAgentFromFile(path))
  );

  const agents: AgentDefinition[] = [];
  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (!result) {
      continue;
    }

    if (result.ok) {
      agents.push(result.value);
    } else {
      const path = filePaths[i];
      errors.push(`${path}: ${result.error.message}`);
    }
  }

  if (errors.length > 0) {
    logger.warn('Some agents failed to load', {
      errorCount: errors.length,
      successCount: agents.length,
    });
  }

  if (agents.length === 0) {
    return failure({
      type: 'validation',
      message: 'No agents loaded successfully',
      fields: { errors: errors.join('; ') },
    });
  }

  logger.info('Agents loaded', {
    count: agents.length,
    failed: errors.length,
  });

  return success(agents);
}
