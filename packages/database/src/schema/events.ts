import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { workspaces } from './workspaces.js';
import { projects } from './projects.js';

export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    source: text('source').notNull(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    payload: text('payload', { mode: 'json' }).notNull(),
    processed: integer('processed', { mode: 'boolean' })
      .notNull()
      .default(false),
    processedBy: text('processed_by'),
    processedAt: integer('processed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    typeIdx: index('events_type_idx').on(table.type),
    processedCreatedIdx: index('events_processed_created_idx').on(
      table.processed,
      table.createdAt
    ),
  })
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
