/**
 * Agent orchestrator for coordinating agent execution
 */

import { getLogger } from '../shared/logger.js';
import type { Result } from '../shared/result.js';
import { failure, success } from '../shared/result.js';
import { getClaudeCli } from '../claude/claude-cli.js';
import type { ClaudeCli } from '../claude/claude-cli.js';
import type { Event } from '../events/types.js';
import type {
  Agent,
  AgentDefinition,
  AgentExecutionContext,
  AgentExecutionOptions,
  AgentExecutionResult,
} from './types.js';

export interface AgentOrchestratorOptions {
  readonly claudeCli?: ClaudeCli;
}

export interface AgentOrchestrator {
  registerAgent(definition: AgentDefinition): void;
  unregisterAgent(agentId: string): void;
  getAgent(agentId: string): Agent | undefined;
  listAgents(): readonly Agent[];
  findAgentsForEvent(event: Event): readonly Agent[];
  executeAgent(
    agentId: string,
    message: string,
    context: AgentExecutionContext,
    options?: AgentExecutionOptions
  ): Promise<Result<AgentExecutionResult>>;
}

class DefaultAgent implements Agent {
  constructor(
    readonly definition: AgentDefinition,
    private readonly _claudeCli: ClaudeCli,
    private readonly _logger = getLogger().child({
      component: 'Agent',
      agentId: definition.id,
    })
  ) {}

  async execute(
    message: string,
    context: AgentExecutionContext,
    options?: AgentExecutionOptions
  ): Promise<AgentExecutionResult> {
    const startTime = new Date();

    this._logger.info('Executing agent', {
      agentId: this.definition.id,
      agentName: this.definition.name,
      projectId: context.projectId,
      taskId: context.taskId,
      eventId: context.eventId,
    });

    if (options?.cancellationToken?.isCancelled) {
      return {
        success: false,
        output: '',
        error: 'Operation was cancelled before execution',
        turnsUsed: 0,
        startTime,
        endTime: new Date(),
        cancelled: true,
      };
    }

    const result = await this._claudeCli.execute(message, {
      cwd: context.cwd,
      systemPrompt: this.definition.systemPrompt,
      allowedTools: this.definition.allowedTools,
      maxTurns: this.definition.maxTurns,
      cancellationToken: options?.cancellationToken,
      onProgress: options?.onProgress
        ? (progress) => {
            options.onProgress?.({
              agentId: this.definition.id,
              taskId: context.taskId,
              type: progress.type,
              message: progress.message,
              toolName: progress.toolName,
              currentTurn: progress.currentTurn ?? 0,
              maxTurns: progress.maxTurns ?? this.definition.maxTurns,
              percent: progress.percent ?? 0,
              timestamp: progress.timestamp,
            });
          }
        : undefined,
    });

    const endTime = new Date();

    if (!result.ok) {
      const isCancelled = result.error.message.includes('cancelled') ||
        result.error.type === 'timeout';

      this._logger.error('Agent execution failed', {
        agentId: this.definition.id,
        error: result.error,
        cancelled: isCancelled,
      });

      return {
        success: false,
        output: '',
        error: result.error.message,
        turnsUsed: 0,
        startTime,
        endTime,
        cancelled: isCancelled,
      };
    }

    const processResult = result.value;

    this._logger.info('Agent execution completed', {
      agentId: this.definition.id,
      success: processResult.success,
      outputLength: processResult.output.length,
      duration: endTime.getTime() - startTime.getTime(),
    });

    return {
      success: processResult.success,
      output: processResult.output,
      error: processResult.error,
      turnsUsed: processResult.messages.length,
      startTime,
      endTime,
    };
  }
}

class DefaultAgentOrchestrator implements AgentOrchestrator {
  private readonly _agents = new Map<string, Agent>();
  private readonly _claudeCli: ClaudeCli;
  private readonly _logger = getLogger().child({
    component: 'AgentOrchestrator',
  });

  constructor(options: AgentOrchestratorOptions = {}) {
    this._claudeCli = options.claudeCli || getClaudeCli();
  }

  registerAgent(definition: AgentDefinition): void {
    const agent = new DefaultAgent(definition, this._claudeCli);
    this._agents.set(definition.id, agent);

    this._logger.info('Agent registered', {
      agentId: definition.id,
      agentName: definition.name,
      trustLevel: definition.trustLevel,
      triggerCount: definition.triggers.length,
    });
  }

  unregisterAgent(agentId: string): void {
    const removed = this._agents.delete(agentId);

    if (removed) {
      this._logger.info('Agent unregistered', { agentId });
    } else {
      this._logger.warn('Attempted to unregister unknown agent', { agentId });
    }
  }

  getAgent(agentId: string): Agent | undefined {
    return this._agents.get(agentId);
  }

  listAgents(): readonly Agent[] {
    return Array.from(this._agents.values());
  }

  findAgentsForEvent(event: Event): readonly Agent[] {
    const matchingAgents: Agent[] = [];

    for (const agent of this._agents.values()) {
      for (const trigger of agent.definition.triggers) {
        if (this._matchesTrigger(event, trigger.event)) {
          matchingAgents.push(agent);
          break;
        }
      }
    }

    this._logger.debug('Found agents for event', {
      eventType: event.type,
      eventId: event.id,
      agentCount: matchingAgents.length,
    });

    return matchingAgents;
  }

  async executeAgent(
    agentId: string,
    message: string,
    context: AgentExecutionContext,
    options?: AgentExecutionOptions
  ): Promise<Result<AgentExecutionResult>> {
    const agent = this._agents.get(agentId);

    if (!agent) {
      this._logger.error('Agent not found', { agentId });
      return failure({
        type: 'notFound',
        message: `Agent not found: ${agentId}`,
        resource: 'agent',
      });
    }

    this._logger.info('Executing agent', {
      agentId,
      agentName: agent.definition.name,
      projectId: context.projectId,
    });

    const result = await agent.execute(message, context, options);
    return success(result);
  }

  private _matchesTrigger(event: Event, triggerPattern: string): boolean {
    if (triggerPattern === '*') {
      return true;
    }

    if (triggerPattern.includes('*')) {
      const regex = new RegExp(
        '^' + triggerPattern.replace(/\*/g, '.*') + '$'
      );
      return regex.test(event.type);
    }

    return event.type === triggerPattern;
  }
}

let defaultOrchestrator: AgentOrchestrator | undefined;

export function createAgentOrchestrator(
  options?: AgentOrchestratorOptions
): AgentOrchestrator {
  return new DefaultAgentOrchestrator(options);
}

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!defaultOrchestrator) {
    defaultOrchestrator = createAgentOrchestrator();
  }
  return defaultOrchestrator;
}

export function setAgentOrchestrator(orchestrator: AgentOrchestrator): void {
  defaultOrchestrator = orchestrator;
}
