/**
 * Tests for the event-driven agent trigger system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createEventBus, type EventBus } from './event-bus.js';
import { createEventTrigger, type EventTrigger } from './event-trigger.js';
import {
  createAgentOrchestrator,
  type AgentOrchestrator,
} from '../agents/agent-orchestrator.js';
import { createTaskQueue, type TaskQueue } from '../tasks/task-queue.js';
import type { AgentDefinition } from '../agents/types.js';
import type { Event } from './types.js';

describe('EventTrigger', () => {
  let eventBus: EventBus;
  let orchestrator: AgentOrchestrator;
  let taskQueue: TaskQueue;
  let eventTrigger: EventTrigger;

  const mockAgentDefinition: AgentDefinition = {
    id: 'test-agent',
    name: 'Test Agent',
    description: 'A test agent',
    triggers: [
      { event: 'code.file.created', action: 'review_code' },
      { event: 'requirement.*', action: 'analyze_requirement' },
    ],
    trustLevel: 'medium',
    maxTurns: 10,
    systemPrompt: 'You are a test agent.',
  };

  const createTestEvent = (type: string): Event => ({
    id: 'evt_test_123',
    type,
    source: 'test',
    projectId: 'proj_123',
    workspaceId: 'ws_123',
    payload: { data: 'test' },
    timestamp: new Date(),
  });

  beforeEach(() => {
    eventBus = createEventBus();
    orchestrator = createAgentOrchestrator();
    taskQueue = createTaskQueue();

    orchestrator.registerAgent(mockAgentDefinition);

    eventTrigger = createEventTrigger({
      eventBus,
      orchestrator,
      taskQueue,
      projectCwd: '/test/project',
      defaultWorkspaceId: 'ws_default',
      createTasks: true,
      autoExecute: false,
    });
  });

  describe('getTriggeredAgents', () => {
    it('should find agents for exact event match', () => {
      const event = createTestEvent('code.file.created');
      const triggered = eventTrigger.getTriggeredAgents(event);

      expect(triggered).toHaveLength(1);
      expect(triggered[0]?.agent.definition.id).toBe('test-agent');
      expect(triggered[0]?.action).toBe('review_code');
    });

    it('should find agents for wildcard event match', () => {
      const event = createTestEvent('requirement.created');
      const triggered = eventTrigger.getTriggeredAgents(event);

      expect(triggered).toHaveLength(1);
      expect(triggered[0]?.action).toBe('analyze_requirement');
    });

    it('should return empty array for non-matching events', () => {
      const event = createTestEvent('unknown.event');
      const triggered = eventTrigger.getTriggeredAgents(event);

      expect(triggered).toHaveLength(0);
    });
  });

  describe('trigger', () => {
    it('should create tasks for triggered agents when createTasks is true', async () => {
      const event = createTestEvent('code.file.created');
      const result = await eventTrigger.trigger(event);

      expect(result.triggeredAgents).toHaveLength(1);
      expect(result.taskIds).toHaveLength(1);

      const tasksResult = taskQueue.list();
      expect(tasksResult.ok).toBe(true);
      if (tasksResult.ok) {
        expect(tasksResult.value).toHaveLength(1);
        expect(tasksResult.value[0]?.agentId).toBe('test-agent');
      }
    });

    it('should return empty result for non-triggering events', async () => {
      const event = createTestEvent('unknown.event');
      const result = await eventTrigger.trigger(event);

      expect(result.triggeredAgents).toHaveLength(0);
      expect(result.taskIds).toBeUndefined();
    });

    it('should not create tasks for system events', async () => {
      eventTrigger.start();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const tasksResult = taskQueue.list();
      expect(tasksResult.ok).toBe(true);
      if (tasksResult.ok) {
        expect(tasksResult.value).toHaveLength(0);
      }

      eventTrigger.stop();
    });
  });

  describe('start/stop', () => {
    it('should start and stop without errors', () => {
      expect(eventTrigger.isRunning()).toBe(false);

      eventTrigger.start();
      expect(eventTrigger.isRunning()).toBe(true);

      eventTrigger.stop();
      expect(eventTrigger.isRunning()).toBe(false);
    });

    it('should not double start', () => {
      eventTrigger.start();
      eventTrigger.start();

      expect(eventTrigger.isRunning()).toBe(true);

      eventTrigger.stop();
    });

    it('should not double stop', () => {
      eventTrigger.stop();
      eventTrigger.stop();

      expect(eventTrigger.isRunning()).toBe(false);
    });
  });

  describe('event bus integration', () => {
    it('should trigger agents when events are published', async () => {
      eventTrigger.start();

      const event: Omit<Event, 'id' | 'timestamp'> = {
        type: 'code.file.created',
        source: 'test',
        projectId: 'proj_123',
        workspaceId: 'ws_123',
        payload: { path: '/test.ts' },
      };

      eventBus.publish(event);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const tasksResult = taskQueue.list();
      expect(tasksResult.ok).toBe(true);
      if (tasksResult.ok) {
        expect(tasksResult.value).toHaveLength(1);
      }

      eventTrigger.stop();
    });
  });

  describe('multiple agents', () => {
    it('should trigger multiple agents for same event', async () => {
      const secondAgent: AgentDefinition = {
        id: 'second-agent',
        name: 'Second Agent',
        description: 'Another agent',
        triggers: [{ event: 'code.file.created', action: 'lint_code' }],
        trustLevel: 'low',
        maxTurns: 5,
        systemPrompt: 'You are the second agent.',
      };

      orchestrator.registerAgent(secondAgent);

      const event = createTestEvent('code.file.created');
      const result = await eventTrigger.trigger(event);

      expect(result.triggeredAgents).toHaveLength(2);
      expect(result.taskIds).toHaveLength(2);
    });
  });
});
