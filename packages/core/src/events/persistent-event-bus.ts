/**
 * Persistent event bus that stores events to SQLite
 *
 * This wraps the in-memory event bus and persists events to the database
 * for durability, replay capability, and audit purposes.
 */

import { getLogger } from '../shared/logger.js';
import type { Event, EventHandler, EventSubscription } from './types.js';
import type { EventBus, EventBusOptions } from './event-bus.js';
import { createEventBus } from './event-bus.js';

export interface EventStore {
  save(event: Event): Promise<void>;
  findUnprocessed(limit?: number): Promise<Event[]>;
  markAsProcessed(eventId: string, processedBy: string): Promise<void>;
  findByType(type: string, limit?: number): Promise<Event[]>;
  findByProjectId(projectId: string, limit?: number): Promise<Event[]>;
  findRecent(limit?: number): Promise<Event[]>;
}

export interface PersistentEventBusOptions extends EventBusOptions {
  readonly store: EventStore;
  readonly replayUnprocessed?: boolean;
}

export interface PersistentEventBus extends EventBus {
  getStore(): EventStore;
  replayUnprocessed(): Promise<number>;
  markEventProcessed(eventId: string, processedBy: string): Promise<void>;
  getRecentEvents(limit?: number): Promise<readonly Event[]>;
  getEventsByType(type: string, limit?: number): Promise<readonly Event[]>;
  getEventsByProject(projectId: string, limit?: number): Promise<readonly Event[]>;
}

class DefaultPersistentEventBus implements PersistentEventBus {
  private readonly _innerBus: EventBus;
  private readonly _store: EventStore;
  private readonly _logger = getLogger().child({ component: 'PersistentEventBus' });
  private _initialized = false;

  constructor(options: PersistentEventBusOptions) {
    this._store = options.store;
    this._innerBus = createEventBus({ maxQueueSize: options.maxQueueSize });
  }

  async initialize(replayUnprocessed = false): Promise<void> {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    if (replayUnprocessed) {
      const count = await this.replayUnprocessed();
      this._logger.info('Replayed unprocessed events', { count });
    }
  }

  publish(eventData: Omit<Event, 'id' | 'timestamp'>): void {
    const event: Event = {
      ...eventData,
      id: this._generateId(),
      timestamp: new Date(),
    };

    this._store.save(event).catch((error) => {
      this._logger.error('Failed to persist event', {
        eventId: event.id,
        eventType: event.type,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    this._innerBus.publish(event);
  }

  subscribe<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): EventSubscription {
    return this._innerBus.subscribe(eventType, handler);
  }

  unsubscribe<T = unknown>(eventType: string, handler: EventHandler<T>): void {
    this._innerBus.unsubscribe(eventType, handler);
  }

  clear(): void {
    this._innerBus.clear();
  }

  getStore(): EventStore {
    return this._store;
  }

  async replayUnprocessed(): Promise<number> {
    const unprocessedEvents = await this._store.findUnprocessed();

    this._logger.info('Replaying unprocessed events', {
      count: unprocessedEvents.length,
    });

    for (const event of unprocessedEvents) {
      this._innerBus.publish(event);
    }

    return unprocessedEvents.length;
  }

  async markEventProcessed(eventId: string, processedBy: string): Promise<void> {
    await this._store.markAsProcessed(eventId, processedBy);

    this._logger.debug('Marked event as processed', {
      eventId,
      processedBy,
    });
  }

  async getRecentEvents(limit = 100): Promise<readonly Event[]> {
    return this._store.findRecent(limit);
  }

  async getEventsByType(type: string, limit = 100): Promise<readonly Event[]> {
    return this._store.findByType(type, limit);
  }

  async getEventsByProject(
    projectId: string,
    limit = 100
  ): Promise<readonly Event[]> {
    return this._store.findByProjectId(projectId, limit);
  }

  private _generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

export function createPersistentEventBus(
  options: PersistentEventBusOptions
): PersistentEventBus {
  return new DefaultPersistentEventBus(options);
}

/**
 * Adapter to convert a database EventRepository to an EventStore
 */
export function createEventStoreAdapter(repository: {
  createEvent(data: {
    type: string;
    source: string;
    projectId: string;
    workspaceId: string;
    payload: unknown;
  }): Promise<unknown>;
  findUnprocessed(limit?: number): Promise<Array<{
    id: string;
    type: string;
    source: string;
    projectId: string;
    workspaceId: string;
    payload: unknown;
    processed: boolean;
    processedBy?: string | null;
    processedAt?: Date | null;
    createdAt: Date;
  }>>;
  markAsProcessed(id: string, processedBy: string): Promise<unknown>;
  findByType(type: string, limit?: number): Promise<Array<{
    id: string;
    type: string;
    source: string;
    projectId: string;
    workspaceId: string;
    payload: unknown;
    processed: boolean;
    processedBy?: string | null;
    processedAt?: Date | null;
    createdAt: Date;
  }>>;
  findByProjectId(projectId: string, limit?: number): Promise<Array<{
    id: string;
    type: string;
    source: string;
    projectId: string;
    workspaceId: string;
    payload: unknown;
    processed: boolean;
    processedBy?: string | null;
    processedAt?: Date | null;
    createdAt: Date;
  }>>;
  findMany(options?: { limit?: number; orderBy?: unknown }): Promise<Array<{
    id: string;
    type: string;
    source: string;
    projectId: string;
    workspaceId: string;
    payload: unknown;
    processed: boolean;
    processedBy?: string | null;
    processedAt?: Date | null;
    createdAt: Date;
  }>>;
}): EventStore {
  const mapDbEventToEvent = (dbEvent: {
    id: string;
    type: string;
    source: string;
    projectId: string;
    workspaceId: string;
    payload: unknown;
    createdAt: Date;
  }): Event => ({
    id: dbEvent.id,
    type: dbEvent.type,
    source: dbEvent.source,
    projectId: dbEvent.projectId,
    workspaceId: dbEvent.workspaceId,
    payload: dbEvent.payload as Record<string, unknown>,
    timestamp: dbEvent.createdAt,
  });

  return {
    async save(event: Event): Promise<void> {
      await repository.createEvent({
        type: event.type,
        source: event.source,
        projectId: event.projectId,
        workspaceId: event.workspaceId,
        payload: event.payload,
      });
    },

    async findUnprocessed(limit?: number): Promise<Event[]> {
      const events = await repository.findUnprocessed(limit);
      return events.map(mapDbEventToEvent);
    },

    async markAsProcessed(eventId: string, processedBy: string): Promise<void> {
      await repository.markAsProcessed(eventId, processedBy);
    },

    async findByType(type: string, limit?: number): Promise<Event[]> {
      const events = await repository.findByType(type, limit);
      return events.map(mapDbEventToEvent);
    },

    async findByProjectId(projectId: string, limit?: number): Promise<Event[]> {
      const events = await repository.findByProjectId(projectId, limit);
      return events.map(mapDbEventToEvent);
    },

    async findRecent(limit = 100): Promise<Event[]> {
      const events = await repository.findMany({ limit });
      return events.map(mapDbEventToEvent);
    },
  };
}
