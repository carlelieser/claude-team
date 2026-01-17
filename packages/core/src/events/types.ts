/**
 * Event system types
 */

export interface Event {
  readonly id: string;
  readonly type: string;
  readonly source: string;
  readonly timestamp: Date;
  readonly payload: Record<string, unknown>;
  readonly projectId: string;
  readonly workspaceId: string;
}

export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe(): void;
}

export interface EventEmitter {
  emit(event: Event): void;
  on<T = unknown>(eventType: string, handler: EventHandler<T>): EventSubscription;
  off<T = unknown>(eventType: string, handler: EventHandler<T>): void;
  once<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): EventSubscription;
}
