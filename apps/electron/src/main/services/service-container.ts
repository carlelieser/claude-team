/**
 * Service container for managing core services
 */

import { join } from 'node:path';
import { app } from 'electron';
import {
  type PersistentEventBus,
  createPersistentEventBus,
  type EventStore,
  type Event as CoreEvent,
  type AgentOrchestrator,
  createAgentOrchestrator,
  type TaskProcessor,
  createTaskProcessor,
  type TaskQueue,
  createTaskQueue,
  setTaskQueue,
  createAgentTaskHandler,
  loadAndRegisterAgents,
  createLogger,
  setLogger,
  type Logger,
} from '@claude-team/core';
import {
  type DbClient,
  createDatabaseClient,
  closeDatabaseClient,
  TaskRepository,
  EventRepository,
  ProjectRepository,
  WorkspaceRepository,
  AgentActionRepository,
  migrate,
} from '@claude-team/database';

export interface ServiceContainerConfig {
  readonly agentsDirectory: string;
  readonly databasePath?: string;
}

export interface ServiceContainer {
  readonly db: DbClient;
  readonly eventBus: PersistentEventBus;
  readonly orchestrator: AgentOrchestrator;
  readonly taskProcessor: TaskProcessor;
  readonly taskQueue: TaskQueue;
  readonly taskRepository: TaskRepository;
  readonly eventRepository: EventRepository;
  readonly projectRepository: ProjectRepository;
  readonly workspaceRepository: WorkspaceRepository;
  readonly agentActionRepository: AgentActionRepository;
  readonly logger: Logger;
  readonly agentTaskHandler: ReturnType<typeof createAgentTaskHandler>;
  shutdown(): Promise<void>;
}

const DEFAULT_DATABASE_NAME = 'claude-team.db';

function getDatabasePath(customPath?: string): string {
  if (customPath) {
    return customPath;
  }

  const userDataPath = app.getPath('userData');
  return join(userDataPath, DEFAULT_DATABASE_NAME);
}

export async function createServiceContainer(
  config: ServiceContainerConfig
): Promise<ServiceContainer> {
  const logger = createLogger({
    name: 'claude-team-electron',
    level: app.isPackaged ? 'info' : 'debug',
  });
  setLogger(logger);

  logger.info('Initializing service container', {
    agentsDirectory: config.agentsDirectory,
    databasePath: config.databasePath,
  });

  const databasePath = getDatabasePath(config.databasePath);

  logger.info('Creating database client', { databasePath });
  const dbClient = createDatabaseClient({ path: databasePath });

  logger.info('Running database migrations');
  migrate(dbClient.db);

  const taskRepository = new TaskRepository(dbClient.db);
  const eventRepository = new EventRepository(dbClient.db);
  const projectRepository = new ProjectRepository(dbClient.db);
  const workspaceRepository = new WorkspaceRepository(dbClient.db);
  const agentActionRepository = new AgentActionRepository(dbClient.db);

  const eventStore: EventStore = {
    async save(event: CoreEvent): Promise<void> {
      await eventRepository.createEvent({
        type: event.type,
        source: event.source,
        projectId: event.projectId,
        workspaceId: event.workspaceId,
        payload: event.payload,
      });
    },

    async findUnprocessed(limit?: number): Promise<CoreEvent[]> {
      const events = await eventRepository.findUnprocessed(limit);
      return events.map((e) => ({
        id: e.id,
        type: e.type,
        source: e.source,
        projectId: e.projectId,
        workspaceId: e.workspaceId,
        payload: e.payload as Record<string, unknown>,
        timestamp: e.createdAt,
      }));
    },

    async markAsProcessed(eventId: string, processedBy: string): Promise<void> {
      await eventRepository.markAsProcessed(eventId, processedBy);
    },

    async findByType(type: string, limit?: number): Promise<CoreEvent[]> {
      const events = await eventRepository.findByType(type, limit);
      return events.map((e) => ({
        id: e.id,
        type: e.type,
        source: e.source,
        projectId: e.projectId,
        workspaceId: e.workspaceId,
        payload: e.payload as Record<string, unknown>,
        timestamp: e.createdAt,
      }));
    },

    async findByProjectId(projectId: string, limit?: number): Promise<CoreEvent[]> {
      const events = await eventRepository.findByProjectId(projectId, limit);
      return events.map((e) => ({
        id: e.id,
        type: e.type,
        source: e.source,
        projectId: e.projectId,
        workspaceId: e.workspaceId,
        payload: e.payload as Record<string, unknown>,
        timestamp: e.createdAt,
      }));
    },

    async findRecent(limit = 100): Promise<CoreEvent[]> {
      const events = await eventRepository.findMany();
      return events.slice(0, limit).map((e) => ({
        id: e.id,
        type: e.type,
        source: e.source,
        projectId: e.projectId,
        workspaceId: e.workspaceId,
        payload: e.payload as Record<string, unknown>,
        timestamp: e.createdAt,
      }));
    },
  };

  const eventBus = createPersistentEventBus({ store: eventStore });

  const orchestrator = createAgentOrchestrator();

  logger.info('Loading agents from directory', {
    directory: config.agentsDirectory,
  });
  const loadResult = await loadAndRegisterAgents(
    config.agentsDirectory,
    orchestrator
  );

  if (loadResult.ok) {
    logger.info('Agents loaded successfully', {
      loadedCount: loadResult.value.loaded.length,
      failedCount: loadResult.value.failed.length,
    });

    for (const failed of loadResult.value.failed) {
      logger.warn('Failed to load agent', {
        path: failed.path,
        error: failed.error,
      });
    }
  } else {
    logger.error('Failed to load agents directory', {
      error: loadResult.error.message,
    });
  }

  const taskQueue = createTaskQueue();
  setTaskQueue(taskQueue);

  const agentTaskHandler = createAgentTaskHandler({
    orchestrator,
    eventBus,
  });

  const taskProcessor = createTaskProcessor({
    queue: taskQueue,
    concurrency: 3,
    pollInterval: 1000,
  });

  taskProcessor.register(agentTaskHandler.asTaskHandler());

  logger.info('Service container initialized');

  return {
    db: dbClient,
    eventBus,
    orchestrator,
    taskProcessor,
    taskQueue,
    taskRepository,
    eventRepository,
    projectRepository,
    workspaceRepository,
    agentActionRepository,
    logger,
    agentTaskHandler,

    async shutdown(): Promise<void> {
      logger.info('Shutting down service container');

      await taskProcessor.stop();
      eventBus.clear();
      closeDatabaseClient(dbClient);

      logger.info('Service container shut down');
    },
  };
}
