import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema/index.js';

export type DrizzleClient = BetterSQLite3Database<typeof schema>;

/**
 * Database client wrapper that holds both the Drizzle ORM client
 * and the underlying SQLite connection for proper lifecycle management.
 */
export interface DbClient {
  readonly db: DrizzleClient;
  readonly sqlite: Database.Database;
}

export interface DatabaseConfig {
  readonly path: string;
  readonly readonly?: boolean;
  readonly verbose?: boolean;
}

const DEFAULT_CONFIG: Required<Omit<DatabaseConfig, 'path'>> = {
  readonly: false,
  verbose: false,
};

/**
 * Creates and configures a database client with optimized settings.
 *
 * @param config - Database configuration including path and options
 * @returns Configured database client wrapper
 */
export function createDatabaseClient(config: DatabaseConfig): DbClient {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const sqlite = new Database(mergedConfig.path, {
    readonly: mergedConfig.readonly,
    verbose: mergedConfig.verbose ? console.log : undefined,
  });

  // Enable WAL mode for better concurrent access
  sqlite.pragma('journal_mode = WAL');

  // Optimize for performance
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('cache_size = -64000'); // 64MB cache
  sqlite.pragma('temp_store = MEMORY');
  sqlite.pragma('mmap_size = 30000000000'); // 30GB memory map

  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  return { db, sqlite };
}

/**
 * Closes the database connection.
 *
 * @param client - Database client wrapper to close
 */
export function closeDatabaseClient(client: DbClient): void {
  client.sqlite.close();
}
