import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects.js';

export const fileIndex = sqliteTable(
  'file_index',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    path: text('path').notNull(),
    contentHash: text('content_hash').notNull(),
    language: text('language'),
    sizeBytes: integer('size_bytes'),
    symbols: text('symbols', { mode: 'json' }),
    imports: text('imports', { mode: 'json' }),
    indexedAt: integer('indexed_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    projectPathUnique: unique().on(table.projectId, table.path),
  })
);

export type FileIndex = typeof fileIndex.$inferSelect;
export type NewFileIndex = typeof fileIndex.$inferInsert;
