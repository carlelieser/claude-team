/**
 * Result type for functional error handling
 * Domain layer MUST return Result instead of throwing exceptions
 */

import type { Failure } from './types.js';

export type Result<T, E = Failure> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Create a successful Result
 */
export function success<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Create a failed Result
 */
export function failure<E = Failure>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Map a Result value to a new type
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) {
    return success(fn(result.value));
  }
  return result;
}

/**
 * Chain Result-returning operations
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

/**
 * Map a Result error to a new type
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (!result.ok) {
    return failure(fn(result.error));
  }
  return result;
}

/**
 * Get the value from a Result or a default value
 */
export function getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/**
 * Convert a Promise to a Result, catching any errors
 */
export async function fromPromise<T>(
  promise: Promise<T>,
  errorMapper?: (error: unknown) => Failure
): Promise<Result<T, Failure>> {
  try {
    const value = await promise;
    return success(value);
  } catch (error) {
    if (errorMapper) {
      return failure(errorMapper(error));
    }

    if (error instanceof Error) {
      return failure({
        type: 'unknown',
        message: error.message,
        cause: error.stack,
      });
    }

    return failure({
      type: 'unknown',
      message: String(error),
    });
  }
}

/**
 * Convert a Result to a Promise (throws if error)
 */
export function toPromise<T, E>(result: Result<T, E>): Promise<T> {
  if (result.ok) {
    return Promise.resolve(result.value);
  }
  return Promise.reject(result.error);
}
