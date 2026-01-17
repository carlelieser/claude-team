/**
 * Event bus implementation for cross-agent communication
 */

import { nanoid } from 'nanoid';
import { getLogger } from '../shared/logger.js';
import { createEventEmitter } from './event-emitter.js';
import type { Event, EventEmitter, EventHandler, EventSubscription } from './types.js';

export interface EventBusOptions {
  readonly maxQueueSize?: number;
}

export interface EventBus {
  publish(event: Omit<Event, 'id' | 'timestamp'>): void;
  subscribe<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): EventSubscription;
  unsubscribe<T = unknown>(eventType: string, handler: EventHandler<T>): void;
  clear(): void;
}

class DefaultEventBus implements EventBus {
  private readonly _emitter: EventEmitter;
  private readonly _maxQueueSize: number;
  private readonly _eventQueue: Event[] = [];
  private readonly _logger = getLogger().child({ component: 'EventBus' });

  constructor(options: EventBusOptions = {}) {
    this._emitter = createEventEmitter();
    this._maxQueueSize = options.maxQueueSize || 1000;
  }

  publish(event: Omit<Event, 'id' | 'timestamp'>): void {
    const fullEvent: Event = {
      ...event,
      id: nanoid(),
      timestamp: new Date(),
    };

    this._logger.info('Publishing event', {
      eventId: fullEvent.id,
      eventType: fullEvent.type,
      source: fullEvent.source,
      projectId: fullEvent.projectId,
    });

    if (this._eventQueue.length >= this._maxQueueSize) {
      this._logger.warn('Event queue full, removing oldest event', {
        queueSize: this._eventQueue.length,
        maxQueueSize: this._maxQueueSize,
      });
      this._eventQueue.shift();
    }

    this._eventQueue.push(fullEvent);
    this._emitter.emit(fullEvent);
  }

  subscribe<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): EventSubscription {
    this._logger.debug('Subscribing to event type', { eventType });
    return this._emitter.on(eventType, handler);
  }

  unsubscribe<T = unknown>(eventType: string, handler: EventHandler<T>): void {
    this._logger.debug('Unsubscribing from event type', { eventType });
    this._emitter.off(eventType, handler);
  }

  clear(): void {
    this._logger.debug('Clearing event queue', {
      queueSize: this._eventQueue.length,
    });
    this._eventQueue.length = 0;
  }

  /**
   * Get recent events (for debugging/monitoring)
   */
  getRecentEvents(limit = 100): readonly Event[] {
    const start = Math.max(0, this._eventQueue.length - limit);
    return this._eventQueue.slice(start);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string, limit = 100): readonly Event[] {
    return this._eventQueue
      .filter((event) => event.type === eventType)
      .slice(-limit);
  }
}

let defaultEventBus: EventBus | undefined;

/**
 * Create a new event bus instance
 */
export function createEventBus(options?: EventBusOptions): EventBus {
  return new DefaultEventBus(options);
}

/**
 * Get or create the default event bus instance
 */
export function getEventBus(): EventBus {
  if (!defaultEventBus) {
    defaultEventBus = createEventBus();
  }
  return defaultEventBus;
}

/**
 * Set the default event bus instance
 */
export function setEventBus(eventBus: EventBus): void {
  defaultEventBus = eventBus;
}
