import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { projects } from './projects.js';

export const agentConfigs = sqliteTable(
  'agent_configs',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    agentId: text('agent_id').notNull(),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    trustLevel: text('trust_level', {
      enum: ['low', 'medium', 'high'],
    })
      .notNull()
      .default('medium'),
    maxTurns: integer('max_turns').notNull().default(50),
    allowedTools: text('allowed_tools', { mode: 'json' }),
    config: text('config', { mode: 'json' }),
  },
  (table) => ({
    projectAgentUnique: unique().on(table.projectId, table.agentId),
  })
);

export type AgentConfig = typeof agentConfigs.$inferSelect;
export type NewAgentConfig = typeof agentConfigs.$inferInsert;
