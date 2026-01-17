/**
 * Tests for the agent task handler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createAgentTaskHandler, type AgentTaskHandler } from './agent-task-handler.js';
import { createEventBus, type EventBus } from '../events/event-bus.js';
import type { Event } from '../events/types.js';
import {
  createAgentOrchestrator,
  type AgentOrchestrator,
} from '../agents/agent-orchestrator.js';
import type { AgentDefinition } from '../agents/types.js';
import type { Task } from './types.js';

describe('AgentTaskHandler', () => {
  let eventBus: EventBus;
  let orchestrator: AgentOrchestrator;
  let taskHandler: AgentTaskHandler;

  const mockAgentDefinition: AgentDefinition = {
    id: 'test-agent',
    name: 'Test Agent',
    description: 'A test agent',
    triggers: [{ event: 'task.created', action: 'process' }],
    trustLevel: 'medium',
    maxTurns: 10,
    systemPrompt: 'You are a test agent.',
  };

  const createTestTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task_123',
    projectId: 'proj_123',
    agentId: 'test-agent',
    title: 'Test Task',
    description: 'A test task description',
    status: 'pending',
    priority: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      message: 'Please process this task',
      cwd: '/test/project',
      workspaceId: 'ws_123',
    },
    ...overrides,
  });

  beforeEach(() => {
    eventBus = createEventBus();
    orchestrator = createAgentOrchestrator();
    orchestrator.registerAgent(mockAgentDefinition);

    taskHandler = createAgentTaskHandler({
      orchestrator,
      eventBus,
    });
  });

  describe('handle', () => {
    it('should fail if task has no agentId', async () => {
      const task = createTestTask({ agentId: undefined });
      const result = await taskHandler.handle(task);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('validation');
        expect(result.error.message).toContain('no assigned agent');
      }
    });

    it('should fail if task metadata is missing', async () => {
      const task = createTestTask({ metadata: undefined });
      const result = await taskHandler.handle(task);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('validation');
        expect(result.error.message).toContain('metadata');
      }
    });

    it('should fail if cwd is missing from metadata', async () => {
      const task = createTestTask({
        metadata: {
          message: 'Test',
          workspaceId: 'ws_123',
        },
      });
      const result = await taskHandler.handle(task);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('validation');
        expect(result.error.message).toContain('cwd');
      }
    });

    it('should fail if workspaceId is missing from metadata', async () => {
      const task = createTestTask({
        metadata: {
          message: 'Test',
          cwd: '/test',
        },
      });
      const result = await taskHandler.handle(task);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('validation');
        expect(result.error.message).toContain('workspaceId');
      }
    });

    it('should fail if agent is not found', async () => {
      const task = createTestTask({ agentId: 'unknown-agent' });
      const result = await taskHandler.handle(task);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('notFound');
      }
    });
  });

  describe('asTaskHandler', () => {
    it('should return a function that can be used as TaskHandler', () => {
      const handler = taskHandler.asTaskHandler();
      expect(typeof handler).toBe('function');
    });

    it('should skip non-agent tasks silently', async () => {
      const handler = taskHandler.asTaskHandler();
      const task = createTestTask({ agentId: undefined });

      await expect(handler(task)).resolves.not.toThrow();
    });

    it('should throw if agent execution fails', async () => {
      const handler = taskHandler.asTaskHandler();
      const task = createTestTask({ agentId: 'unknown-agent' });

      await expect(handler(task)).rejects.toThrow();
    });
  });

  describe('events', () => {
    it('should emit task.started event when handling starts', async () => {
      const events: Array<{ type: string; payload: unknown }> = [];
      eventBus.subscribe<Event>('task.started', (event) => {
        const evt = event as Event;
        events.push({ type: evt.type, payload: evt.payload });
      });

      const task = createTestTask({ agentId: 'unknown-agent' });
      await taskHandler.handle(task);

      expect(events).toHaveLength(1);
      expect(events[0]?.type).toBe('task.started');
    });

    it('should emit task.failed event when agent not found', async () => {
      const events: Array<{ type: string; payload: unknown }> = [];
      eventBus.subscribe<Event>('task.failed', (event) => {
        const evt = event as Event;
        events.push({ type: evt.type, payload: evt.payload });
      });

      const task = createTestTask({ agentId: 'unknown-agent' });
      await taskHandler.handle(task);

      expect(events).toHaveLength(1);
      expect(events[0]?.type).toBe('task.failed');
    });
  });

  describe('callbacks', () => {
    it('should call onProgress callback', async () => {
      const progressCalls: Array<{ taskId: string; message: string }> = [];

      taskHandler = createAgentTaskHandler({
        orchestrator,
        eventBus,
        onProgress: (taskId, message) => progressCalls.push({ taskId, message }),
      });

      const task = createTestTask({ agentId: 'unknown-agent' });
      await taskHandler.handle(task);

      expect(progressCalls.length).toBeGreaterThan(0);
    });
  });

  describe('message building', () => {
    it('should use task description as message if no message in metadata', async () => {
      const task = createTestTask({
        agentId: 'unknown-agent',
        metadata: {
          cwd: '/test',
          workspaceId: 'ws_123',
        },
        description: 'Process this request',
      });

      const result = await taskHandler.handle(task);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('notFound');
      }
    });

    it('should use task title if no description or message', async () => {
      const task = createTestTask({
        agentId: 'unknown-agent',
        metadata: {
          cwd: '/test',
          workspaceId: 'ws_123',
        },
        description: undefined,
        title: 'Important Task',
      });

      const result = await taskHandler.handle(task);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('notFound');
      }
    });
  });
});
