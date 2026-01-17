/**
 * Common type utilities for database operations.
 */

/**
 * Result type for operations that may fail.
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Pagination options for list queries.
 */
export interface PaginationOptions {
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Sort direction for ordered queries.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Common sort options.
 */
export interface SortOptions {
  readonly field: string;
  readonly direction: SortDirection;
}

/**
 * Filter options for queries.
 */
export interface FilterOptions<T> {
  readonly where?: Partial<T>;
  readonly orderBy?: SortOptions[];
  readonly pagination?: PaginationOptions;
}

/**
 * Timestamp fields that are common across tables.
 */
export interface Timestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entity with ID and timestamps.
 */
export interface BaseEntity extends Timestamps {
  readonly id: string;
}

/**
 * Creates a Result.Ok value.
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Creates a Result.Error value.
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Type guard for Result.Ok.
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/**
 * Type guard for Result.Error.
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}
