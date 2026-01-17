/**
 * Cancellation token for cooperative task cancellation
 *
 * Provides a mechanism to signal cancellation to running operations
 * and allow them to clean up gracefully.
 */

export interface CancellationToken {
  readonly isCancelled: boolean;
  readonly reason?: string;
  register(callback: () => void): () => void;
  throwIfCancelled(): void;
}

export interface CancellationTokenSource {
  readonly token: CancellationToken;
  cancel(reason?: string): void;
  dispose(): void;
}

class DefaultCancellationToken implements CancellationToken {
  private _isCancelled = false;
  private _reason?: string;
  private readonly _callbacks: Set<() => void> = new Set();

  get isCancelled(): boolean {
    return this._isCancelled;
  }

  get reason(): string | undefined {
    return this._reason;
  }

  register(callback: () => void): () => void {
    if (this._isCancelled) {
      callback();
      return () => {};
    }

    this._callbacks.add(callback);
    return () => {
      this._callbacks.delete(callback);
    };
  }

  throwIfCancelled(): void {
    if (this._isCancelled) {
      throw new CancellationError(this._reason);
    }
  }

  _cancel(reason?: string): void {
    if (this._isCancelled) {
      return;
    }

    this._isCancelled = true;
    this._reason = reason;

    for (const callback of this._callbacks) {
      try {
        callback();
      } catch {
        // Ignore callback errors
      }
    }
  }

  _dispose(): void {
    this._callbacks.clear();
  }
}

class DefaultCancellationTokenSource implements CancellationTokenSource {
  private readonly _token: DefaultCancellationToken;
  private _disposed = false;

  constructor() {
    this._token = new DefaultCancellationToken();
  }

  get token(): CancellationToken {
    return this._token;
  }

  cancel(reason?: string): void {
    if (this._disposed) {
      return;
    }
    this._token._cancel(reason);
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._token._dispose();
  }
}

export class CancellationError extends Error {
  override readonly name = 'CancellationError';

  constructor(reason?: string) {
    super(reason ?? 'Operation was cancelled');
  }
}

export function createCancellationTokenSource(): CancellationTokenSource {
  return new DefaultCancellationTokenSource();
}

export const CANCELLED_TOKEN: CancellationToken = Object.freeze({
  isCancelled: true,
  reason: 'Pre-cancelled token',
  register: (callback: () => void) => {
    callback();
    return () => {};
  },
  throwIfCancelled: () => {
    throw new CancellationError('Pre-cancelled token');
  },
});

export const NONE_TOKEN: CancellationToken = Object.freeze({
  isCancelled: false,
  reason: undefined,
  register: () => () => {},
  throwIfCancelled: () => {},
});
