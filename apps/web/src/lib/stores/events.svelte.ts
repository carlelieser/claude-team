/**
 * Event store using Svelte 5 runes
 */

import { ipc, type EventDto, type EventFilterDto } from '$lib/ipc/client';

const MAX_EVENTS = 1000;

class EventStore {
  events = $state<EventDto[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);
  filter = $state<EventFilterDto>({});
  isStreaming = $state(false);

  filteredEvents = $derived(() => {
    let result = this.events;

    if (this.filter.type) {
      result = result.filter((e) => e.type.startsWith(this.filter.type!));
    }

    if (this.filter.source) {
      result = result.filter((e) => e.source === this.filter.source);
    }

    if (this.filter.projectId) {
      result = result.filter((e) => e.projectId === this.filter.projectId);
    }

    return result;
  });

  private _unsubscribeNew: (() => void) | null = null;

  async load(filter?: EventFilterDto): Promise<void> {
    this.loading = true;
    this.error = null;

    if (filter) {
      this.filter = filter;
    }

    try {
      const result = await ipc.event.list({
        ...this.filter,
        limit: this.filter.limit ?? 100,
      });

      if (result.ok) {
        this.events = [...result.value];
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  async startStreaming(types?: readonly string[]): Promise<void> {
    if (this.isStreaming) {
      return;
    }

    const result = await ipc.event.subscribe(types);

    if (result.ok) {
      this.isStreaming = true;
      this._subscribeToNewEvents();
    } else {
      this.error = result.error.message;
    }
  }

  async stopStreaming(): Promise<void> {
    if (!this.isStreaming) {
      return;
    }

    const result = await ipc.event.unsubscribe();

    if (result.ok) {
      this.isStreaming = false;
      this._unsubscribeFromNewEvents();
    }
  }

  setFilter(filter: EventFilterDto): void {
    this.filter = filter;
  }

  clearEvents(): void {
    this.events = [];
  }

  private _subscribeToNewEvents(): void {
    this._unsubscribeNew = ipc.on.eventNew((event: EventDto) => {
      this.events = [event, ...this.events].slice(0, MAX_EVENTS);
    });
  }

  private _unsubscribeFromNewEvents(): void {
    if (this._unsubscribeNew) {
      this._unsubscribeNew();
      this._unsubscribeNew = null;
    }
  }

  getByType(type: string): EventDto[] {
    return this.events.filter((e) => e.type === type);
  }

  getRecent(count: number): EventDto[] {
    return this.events.slice(0, count);
  }
}

export const eventStore = new EventStore();
