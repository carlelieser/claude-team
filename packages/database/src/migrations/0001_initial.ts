import type { DrizzleClient } from '../client.js';
import { sql } from 'drizzle-orm';

/**
 * Initial migration - creates all tables and indexes.
 */
export async function migrate(db: DrizzleClient): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      autonomy_mode TEXT NOT NULL DEFAULT 'supervised',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      indexed_at INTEGER,
      config TEXT
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS agent_configs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      trust_level TEXT NOT NULL DEFAULT 'medium',
      max_turns INTEGER NOT NULL DEFAULT 50,
      allowed_tools TEXT,
      config TEXT,
      UNIQUE(project_id, agent_id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      source TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      payload TEXT NOT NULL,
      processed INTEGER NOT NULL DEFAULT 0,
      processed_by TEXT,
      processed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`CREATE INDEX IF NOT EXISTS events_type_idx ON events(type)`);
  await db.run(sql`
    CREATE INDEX IF NOT EXISTS events_processed_created_idx
    ON events(processed, created_at)
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority INTEGER NOT NULL DEFAULT 0,
      parent_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      started_at INTEGER,
      completed_at INTEGER,
      result TEXT,
      error TEXT
    )
  `);

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS tasks_status_priority_created_idx
    ON tasks(status, priority, created_at)
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS agent_actions (
      id TEXT PRIMARY KEY,
      task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL,
      target TEXT,
      input TEXT,
      output TEXT,
      reasoning TEXT,
      approval_required INTEGER NOT NULL DEFAULT 0,
      approval_status TEXT,
      approved_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      duration_ms INTEGER
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL,
      task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      alternatives TEXT,
      rationale TEXT NOT NULL,
      confidence REAL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS file_index (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      path TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      language TEXT,
      size_bytes INTEGER,
      symbols TEXT,
      imports TEXT,
      indexed_at INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(project_id, path)
    )
  `);
}
