import { q as derived } from "./index.js";
import { i as ipc } from "./button.js";
const MAX_EVENTS = 1e3;
class EventStore {
  events = [];
  loading = false;
  error = null;
  filter = {};
  isStreaming = false;
  #filteredEvents = derived(() => () => {
    let result = this.events;
    if (this.filter.type) {
      result = result.filter((e) => e.type.startsWith(this.filter.type));
    }
    if (this.filter.source) {
      result = result.filter((e) => e.source === this.filter.source);
    }
    if (this.filter.projectId) {
      result = result.filter((e) => e.projectId === this.filter.projectId);
    }
    return result;
  });
  get filteredEvents() {
    return this.#filteredEvents();
  }
  set filteredEvents($$value) {
    return this.#filteredEvents($$value);
  }
  _unsubscribeNew = null;
  async load(filter) {
    this.loading = true;
    this.error = null;
    if (filter) {
      this.filter = filter;
    }
    try {
      const result = await ipc.event.list({ ...this.filter, limit: this.filter.limit ?? 100 });
      if (result.ok) {
        this.events = [...result.value];
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : "Unknown error";
    } finally {
      this.loading = false;
    }
  }
  async startStreaming(types) {
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
  async stopStreaming() {
    if (!this.isStreaming) {
      return;
    }
    const result = await ipc.event.unsubscribe();
    if (result.ok) {
      this.isStreaming = false;
      this._unsubscribeFromNewEvents();
    }
  }
  setFilter(filter) {
    this.filter = filter;
  }
  clearEvents() {
    this.events = [];
  }
  _subscribeToNewEvents() {
    this._unsubscribeNew = ipc.on.eventNew((event) => {
      this.events = [event, ...this.events].slice(0, MAX_EVENTS);
    });
  }
  _unsubscribeFromNewEvents() {
    if (this._unsubscribeNew) {
      this._unsubscribeNew();
      this._unsubscribeNew = null;
    }
  }
  getByType(type) {
    return this.events.filter((e) => e.type === type);
  }
  getRecent(count) {
    return this.events.slice(0, count);
  }
}
const eventStore = new EventStore();
export {
  eventStore as e
};
//# sourceMappingURL=events.svelte.js.map
