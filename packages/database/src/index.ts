// Client exports
export {
  createDatabaseClient,
  closeDatabaseClient,
  type DbClient,
  type DrizzleClient,
  type DatabaseConfig,
} from './client.js';

// Schema exports
export * from './schema/index.js';

// Repository exports
export * from './repositories/index.js';

// Type utilities
export * from './types.js';

// Migration exports
export { migrate } from './migrations/0001_initial.js';
