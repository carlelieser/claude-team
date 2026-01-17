/**
 * Status Command
 * Show project status and information
 */

import Database from 'better-sqlite3';
import { getDatabasePath, readConfig, requireClaudeTeamProject } from '../utils/config.js';
import {
  bold,
  cyan,
  divider,
  fatal,
  green,
  header,
  red,
  section,
  table,
  yellow,
} from '../utils/output.js';
import type { ProjectStatus } from '../types.js';

function getProjectStatus(cwd: string): ProjectStatus {
  const config = readConfig(cwd);
  const dbPath = getDatabasePath(cwd);
  const db = new Database(dbPath, { readonly: true });

  const recentEventsRows = db
    .prepare(
      `
    SELECT id, type, timestamp, data
    FROM events
    ORDER BY timestamp DESC
    LIMIT 5
  `
    )
    .all() as Array<{
    id: string;
    type: string;
    timestamp: number;
    data: string;
  }>;

  const recentEvents = recentEventsRows.map((row) => ({
    id: row.id,
    type: row.type,
    timestamp: new Date(row.timestamp),
    description:
      (JSON.parse(row.data) as { description?: string }).description ??
      'No description',
  }));

  const pendingTasksResult = db
    .prepare(
      `
    SELECT COUNT(*) as count
    FROM tasks
    WHERE status IN ('pending', 'in_progress')
  `
    )
    .get() as { count: number };

  const pendingTasks = pendingTasksResult.count;

  db.close();

  return {
    name: config.name,
    autonomyMode: config.autonomyMode,
    agents: Object.entries(config.agents).map(([role, agentConfig]) => ({
      role: role as ProjectStatus['agents'][number]['role'],
      enabled: agentConfig.enabled,
      trustLevel: agentConfig.trustLevel,
    })),
    recentEvents,
    pendingTasks,
  };
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

export function statusCommand(): void {
  try {
    const cwd = requireClaudeTeamProject();
    const status = getProjectStatus(cwd);

    header('Claude Team Status');

    section('Project Information');
    table([
      { label: 'Name', value: status.name, highlight: true },
      { label: 'Autonomy Mode', value: status.autonomyMode, highlight: true },
    ]);

    section('Agents');
    const enabledAgents = status.agents.filter((a) => a.enabled);
    const disabledAgents = status.agents.filter((a) => !a.enabled);

    if (enabledAgents.length > 0) {
      console.log(bold('  Enabled:'));
      enabledAgents.forEach((agent) => {
        const trustColor =
          agent.trustLevel === 'high'
            ? green
            : agent.trustLevel === 'medium'
              ? yellow
              : red;
        console.log(
          `    ${green('✓')} ${cyan(agent.role)} ${trustColor(`(${agent.trustLevel} trust)`)}`
        );
      });
    }

    if (disabledAgents.length > 0) {
      console.log();
      console.log(bold('  Disabled:'));
      disabledAgents.forEach((agent) => {
        console.log(`    ${red('✗')} ${agent.role}`);
      });
    }

    section('Tasks');
    if (status.pendingTasks > 0) {
      console.log(`  ${yellow(`${status.pendingTasks} pending tasks`)}`);
    } else {
      console.log(`  ${green('No pending tasks')}`);
    }

    section('Recent Activity');
    if (status.recentEvents.length > 0) {
      status.recentEvents.forEach((event) => {
        const timestamp = formatTimestamp(event.timestamp);
        console.log(
          `  ${cyan(event.type)} - ${event.description} ${yellow(`(${timestamp})`)}`
        );
      });
    } else {
      console.log('  No recent activity');
    }

    divider();
  } catch (err) {
    if (err instanceof Error) {
      fatal(err.message);
    }
    fatal('Failed to get project status');
  }
}
