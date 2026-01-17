import { eq, and, desc, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { DrizzleClient } from '../client.js';
import { events, type Event, type NewEvent } from '../schema/events.js';
import { BaseRepository } from './base-repository.js';

export class EventRepository extends BaseRepository<
  typeof events,
  Event,
  NewEvent
> {
  constructor(db: DrizzleClient) {
    super(db, events, events.id);
  }

  /**
   * Creates a new event with auto-generated ID.
   */
  async createEvent(
    data: Omit<NewEvent, 'id' | 'createdAt' | 'processed'>
  ): Promise<Event> {
    return this.create({
      ...data,
      id: nanoid(),
    });
  }

  /**
   * Finds unprocessed events ordered by creation time.
   */
  async findUnprocessed(limit?: number): Promise<Event[]> {
    const query = this._db
      .select()
      .from(events)
      .where(eq(events.processed, false))
      .orderBy(asc(events.createdAt));

    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  /**
   * Finds events by type.
   */
  async findByType(type: string, limit?: number): Promise<Event[]> {
    const query = this._db
      .select()
      .from(events)
      .where(eq(events.type, type))
      .orderBy(desc(events.createdAt));

    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  /**
   * Finds events by project.
   */
  async findByProjectId(projectId: string, limit?: number): Promise<Event[]> {
    const query = this._db
      .select()
      .from(events)
      .where(eq(events.projectId, projectId))
      .orderBy(desc(events.createdAt));

    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  /**
   * Finds events by workspace.
   */
  async findByWorkspaceId(
    workspaceId: string,
    limit?: number
  ): Promise<Event[]> {
    const query = this._db
      .select()
      .from(events)
      .where(eq(events.workspaceId, workspaceId))
      .orderBy(desc(events.createdAt));

    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  /**
   * Marks an event as processed.
   */
  async markAsProcessed(id: string, processedBy: string): Promise<Event | undefined> {
    return this.update(id, {
      processed: true,
      processedBy,
      processedAt: new Date(),
    });
  }

  /**
   * Finds unprocessed events by type.
   */
  async findUnprocessedByType(
    type: string,
    limit?: number
  ): Promise<Event[]> {
    const query = this._db
      .select()
      .from(events)
      .where(and(eq(events.processed, false), eq(events.type, type)))
      .orderBy(asc(events.createdAt));

    if (limit) {
      return query.limit(limit);
    }
    return query;
  }
}
