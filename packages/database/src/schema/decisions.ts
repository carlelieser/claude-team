import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects.js';
import { tasks } from './tasks.js';

export const decisions = sqliteTable('decisions', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull(),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  alternatives: text('alternatives', { mode: 'json' }),
  rationale: text('rationale').notNull(),
  confidence: real('confidence'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Decision = typeof decisions.$inferSelect;
export type NewDecision = typeof decisions.$inferInsert;
