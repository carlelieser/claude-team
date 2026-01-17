import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tasks } from './tasks.js';
import { projects } from './projects.js';

export const agentActions = sqliteTable('agent_actions', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  actionType: text('action_type').notNull(),
  target: text('target'),
  input: text('input', { mode: 'json' }),
  output: text('output', { mode: 'json' }),
  reasoning: text('reasoning'),
  approvalRequired: integer('approval_required', { mode: 'boolean' })
    .notNull()
    .default(false),
  approvalStatus: text('approval_status', {
    enum: ['pending', 'approved', 'rejected'],
  }),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  durationMs: integer('duration_ms'),
});

export type AgentAction = typeof agentActions.$inferSelect;
export type NewAgentAction = typeof agentActions.$inferInsert;
