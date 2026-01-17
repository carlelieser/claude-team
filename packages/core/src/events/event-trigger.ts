/**
 * Event-driven agent trigger system
 *
 * Listens to events on the event bus and automatically triggers
 * the appropriate agents based on their configured triggers.
 */

import type { AgentOrchestrator } from '../agents/agent-orchestrator.js';
import { getAgentOrchestrator } from '../agents/agent-orchestrator.js';
import type { Agent, AgentExecutionContext, AgentExecutionResult } from '../agents/types.js';
import { getLogger } from '../shared/logger.js';
import type { EventBus } from './event-bus.js';
import { getEventBus } from './event-bus.js';
import type { TaskQueue } from '../tasks/task-queue.js';
import { getTaskQueue } from '../tasks/task-queue.js';
import type { Event, EventSubscription } from './types.js';

export interface EventTriggerOptions {
  readonly eventBus?: EventBus;
  readonly orchestrator?: AgentOrchestrator;
  readonly taskQueue?: TaskQueue;
  readonly projectCwd?: string;
  readonly defaultWorkspaceId?: string;
  readonly autoExecute?: boolean;
  readonly createTasks?: boolean;
}

export interface TriggeredAgent {
  readonly agent: Agent;
  readonly event: Event;
  readonly action: string;
}

export interface TriggerResult {
  readonly event: Event;
  readonly triggeredAgents: readonly TriggeredAgent[];
  readonly executions?: readonly AgentExecutionResult[];
  readonly taskIds?: readonly string[];
}

export interface EventTrigger {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  trigger(event: Event): Promise<TriggerResult>;
  getTriggeredAgents(event: Event): readonly TriggeredAgent[];
}

class DefaultEventTrigger implements EventTrigger {
  private readonly _eventBus: EventBus;
  private readonly _orchestrator: AgentOrchestrator;
  private readonly _taskQueue: TaskQueue;
  private readonly _projectCwd: string;
  private readonly _defaultWorkspaceId: string;
  private readonly _autoExecute: boolean;
  private readonly _createTasks: boolean;
  private readonly _logger = getLogger().child({ component: 'EventTrigger' });
  private readonly _subscriptions: EventSubscription[] = [];
  private _running = false;

  constructor(options: EventTriggerOptions = {}) {
    this._eventBus = options.eventBus || getEventBus();
    this._orchestrator = options.orchestrator || getAgentOrchestrator();
    this._taskQueue = options.taskQueue || getTaskQueue();
    this._projectCwd = options.projectCwd || process.cwd();
    this._defaultWorkspaceId = options.defaultWorkspaceId || 'default';
    this._autoExecute = options.autoExecute ?? false;
    this._createTasks = options.createTasks ?? true;
  }

  start(): void {
    if (this._running) {
      this._logger.warn('Event trigger already running');
      return;
    }

    this._running = true;

    const subscription = this._eventBus.subscribe<Event>('*', (event) => {
      this._handleEvent(event as Event).catch((error) => {
        this._logger.error('Error handling event', {
          eventId: (event as Event).id,
          eventType: (event as Event).type,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    });

    this._subscriptions.push(subscription);

    this._logger.info('Event trigger started');
  }

  stop(): void {
    if (!this._running) {
      this._logger.warn('Event trigger already stopped');
      return;
    }

    for (const subscription of this._subscriptions) {
      subscription.unsubscribe();
    }

    this._subscriptions.length = 0;
    this._running = false;

    this._logger.info('Event trigger stopped');
  }

  isRunning(): boolean {
    return this._running;
  }

  async trigger(event: Event): Promise<TriggerResult> {
    const triggeredAgents = this.getTriggeredAgents(event);

    if (triggeredAgents.length === 0) {
      this._logger.debug('No agents triggered for event', {
        eventId: event.id,
        eventType: event.type,
      });

      return {
        event,
        triggeredAgents: [],
      };
    }

    this._logger.info('Triggering agents for event', {
      eventId: event.id,
      eventType: event.type,
      agentCount: triggeredAgents.length,
      agents: triggeredAgents.map((ta) => ta.agent.definition.id),
    });

    if (this._createTasks) {
      const taskIds = await this._createAgentTasks(event, triggeredAgents);

      return {
        event,
        triggeredAgents,
        taskIds,
      };
    }

    if (this._autoExecute) {
      const executions = await this._executeAgents(event, triggeredAgents);

      return {
        event,
        triggeredAgents,
        executions,
      };
    }

    return {
      event,
      triggeredAgents,
    };
  }

  getTriggeredAgents(event: Event): readonly TriggeredAgent[] {
    const agents = this._orchestrator.findAgentsForEvent(event);
    const triggered: TriggeredAgent[] = [];

    for (const agent of agents) {
      const matchingTrigger = agent.definition.triggers.find((trigger) =>
        this._matchesTrigger(event.type, trigger.event)
      );

      if (matchingTrigger) {
        triggered.push({
          agent,
          event,
          action: matchingTrigger.action,
        });
      }
    }

    return triggered;
  }

  private async _handleEvent(event: Event): Promise<void> {
    if (this._isSystemEvent(event)) {
      return;
    }

    await this.trigger(event);
  }

  private _isSystemEvent(event: Event): boolean {
    const systemEvents = [
      'task.started',
      'task.completed',
      'task.failed',
      'agent.started',
      'agent.completed',
      'agent.error',
      'agent.progress',
    ];

    return systemEvents.includes(event.type);
  }

  private async _createAgentTasks(
    event: Event,
    triggeredAgents: readonly TriggeredAgent[]
  ): Promise<string[]> {
    const taskIds: string[] = [];

    for (const { agent, action } of triggeredAgents) {
      const message = this._buildMessage(event, agent, action);

      const taskResult = this._taskQueue.create({
        projectId: event.projectId,
        agentId: agent.definition.id,
        title: `${agent.definition.name}: ${action}`,
        description: message,
        metadata: {
          message,
          cwd: this._projectCwd,
          workspaceId: event.workspaceId || this._defaultWorkspaceId,
          eventId: event.id,
          context: {
            eventType: event.type,
            eventPayload: event.payload,
            action,
          },
        },
      });

      if (taskResult.ok) {
        taskIds.push(taskResult.value.id);

        this._logger.info('Created agent task from event', {
          taskId: taskResult.value.id,
          agentId: agent.definition.id,
          eventId: event.id,
          action,
        });
      } else {
        this._logger.error('Failed to create agent task', {
          agentId: agent.definition.id,
          eventId: event.id,
          error: taskResult.error.message,
        });
      }
    }

    return taskIds;
  }

  private async _executeAgents(
    event: Event,
    triggeredAgents: readonly TriggeredAgent[]
  ): Promise<AgentExecutionResult[]> {
    const executions: AgentExecutionResult[] = [];

    for (const { agent, action } of triggeredAgents) {
      const message = this._buildMessage(event, agent, action);

      const context: AgentExecutionContext = {
        projectId: event.projectId,
        workspaceId: event.workspaceId || this._defaultWorkspaceId,
        cwd: this._projectCwd,
        eventId: event.id,
      };

      const result = await this._orchestrator.executeAgent(
        agent.definition.id,
        message,
        context
      );

      if (result.ok) {
        executions.push(result.value);

        this._logger.info('Agent executed from event trigger', {
          agentId: agent.definition.id,
          eventId: event.id,
          success: result.value.success,
        });
      } else {
        this._logger.error('Agent execution failed from event trigger', {
          agentId: agent.definition.id,
          eventId: event.id,
          error: result.error.message,
        });

        executions.push({
          success: false,
          output: '',
          error: result.error.message,
          turnsUsed: 0,
          startTime: new Date(),
          endTime: new Date(),
        });
      }
    }

    return executions;
  }

  private _buildMessage(event: Event, _agent: Agent, action: string): string {
    const parts: string[] = [];

    parts.push(`Action: ${action}`);
    parts.push(`Event Type: ${event.type}`);
    parts.push(`Source: ${event.source}`);
    parts.push(`Project ID: ${event.projectId}`);

    if (event.payload) {
      parts.push('');
      parts.push('Event Data:');
      parts.push(JSON.stringify(event.payload, null, 2));
    }

    parts.push('');
    parts.push(
      `Please perform the "${action}" action based on this event. ` +
        `Follow your guidelines and provide a complete response.`
    );

    return parts.join('\n');
  }

  private _matchesTrigger(eventType: string, triggerPattern: string): boolean {
    if (triggerPattern === '*') {
      return true;
    }

    if (triggerPattern.includes('*')) {
      const regex = new RegExp(
        '^' + triggerPattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
      );
      return regex.test(eventType);
    }

    return eventType === triggerPattern;
  }
}

export function createEventTrigger(options?: EventTriggerOptions): EventTrigger {
  return new DefaultEventTrigger(options);
}

let defaultEventTrigger: EventTrigger | undefined;

export function getEventTrigger(): EventTrigger {
  if (!defaultEventTrigger) {
    defaultEventTrigger = createEventTrigger();
  }
  return defaultEventTrigger;
}

export function setEventTrigger(trigger: EventTrigger): void {
  defaultEventTrigger = trigger;
}
