import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { projects } from './projects.js';

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    agentId: text('agent_id'),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', {
      enum: ['pending', 'in_progress', 'completed', 'failed', 'canceled'],
    })
      .notNull()
      .default('pending'),
    priority: integer('priority').notNull().default(0),
    parentId: text('parent_id').references((): any => tasks.id, {
      onDelete: 'set null',
    }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    startedAt: integer('started_at', { mode: 'timestamp' }),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    result: text('result', { mode: 'json' }),
    error: text('error'),
  },
  (table) => ({
    statusPriorityCreatedIdx: index('tasks_status_priority_created_idx').on(
      table.status,
      table.priority,
      table.createdAt
    ),
  })
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
