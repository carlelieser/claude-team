/**
 * Type-safe event emitter implementation
 */

import { getLogger } from '../shared/logger.js';
import type {
  Event,
  EventEmitter,
  EventHandler,
  EventSubscription,
} from './types.js';

interface HandlerEntry<T = unknown> {
  readonly handler: EventHandler<T>;
  readonly once: boolean;
}

export class TypedEventEmitter implements EventEmitter {
  private readonly _handlers = new Map<string, HandlerEntry[]>();
  private readonly _logger = getLogger().child({ component: 'EventEmitter' });

  emit(event: Event): void {
    const typeHandlers = this._handlers.get(event.type) || [];
    const wildcardHandlers = this._handlers.get('*') || [];
    const allHandlers = [...typeHandlers, ...wildcardHandlers];

    if (allHandlers.length === 0) {
      this._logger.debug('No handlers for event', {
        eventType: event.type,
        eventId: event.id,
      });
      return;
    }

    this._logger.debug('Emitting event', {
      eventType: event.type,
      eventId: event.id,
      handlerCount: allHandlers.length,
    });

    const oneTimeHandlers: { eventType: string; handler: EventHandler }[] = [];

    for (const entry of typeHandlers) {
      this._invokeHandler(entry, event, event.type, oneTimeHandlers);
    }

    for (const entry of wildcardHandlers) {
      this._invokeHandler(entry, event, '*', oneTimeHandlers);
    }

    for (const { eventType, handler } of oneTimeHandlers) {
      this.off(eventType, handler);
    }
  }

  private _invokeHandler(
    entry: HandlerEntry,
    event: Event,
    eventType: string,
    oneTimeHandlers: { eventType: string; handler: EventHandler }[]
  ): void {
    try {
      const result = entry.handler(event);
      if (result instanceof Promise) {
        result.catch((error) => {
          this._logger.error('Event handler failed', {
            eventType: event.type,
            eventId: event.id,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }

      if (entry.once) {
        oneTimeHandlers.push({ eventType, handler: entry.handler });
      }
    } catch (error) {
      this._logger.error('Event handler threw error', {
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  on<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): EventSubscription {
    const handlers = this._handlers.get(eventType) || [];
    handlers.push({ handler: handler as EventHandler, once: false });
    this._handlers.set(eventType, handlers);

    this._logger.debug('Registered event handler', {
      eventType,
      handlerCount: handlers.length,
    });

    return {
      unsubscribe: () => this.off(eventType, handler),
    };
  }

  off<T = unknown>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this._handlers.get(eventType);
    if (!handlers) {
      return;
    }

    const filtered = handlers.filter((entry) => entry.handler !== handler);
    if (filtered.length === 0) {
      this._handlers.delete(eventType);
    } else {
      this._handlers.set(eventType, filtered);
    }

    this._logger.debug('Unregistered event handler', {
      eventType,
      handlerCount: filtered.length,
    });
  }

  once<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): EventSubscription {
    const handlers = this._handlers.get(eventType) || [];
    handlers.push({ handler: handler as EventHandler, once: true });
    this._handlers.set(eventType, handlers);

    this._logger.debug('Registered one-time event handler', {
      eventType,
      handlerCount: handlers.length,
    });

    return {
      unsubscribe: () => this.off(eventType, handler),
    };
  }

  /**
   * Get the number of handlers for an event type
   */
  listenerCount(eventType: string): number {
    return this._handlers.get(eventType)?.length || 0;
  }

  /**
   * Remove all handlers for an event type
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this._handlers.delete(eventType);
      this._logger.debug('Removed all handlers for event type', { eventType });
    } else {
      this._handlers.clear();
      this._logger.debug('Removed all event handlers');
    }
  }
}

export function createEventEmitter(): EventEmitter {
  return new TypedEventEmitter();
}
