/**
 * Init Command
 * Initialize a new claude-team project
 */

import { existsSync } from 'fs';
import { basename } from 'path';
import Database from 'better-sqlite3';
import type { InitOptions } from '../types.js';
import {
  createDefaultConfig,
  getDatabasePath,
  isClaudeTeamProject,
} from '../utils/config.js';
import {
  error,
  fatal,
  header,
  info,
  list,
  section,
  spinner,
  success,
} from '../utils/output.js';

const CLAUDE_CLI_CHECK_COMMAND = 'which claude';

async function checkClaudeCliInstalled(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    const result = execSync(CLAUDE_CLI_CHECK_COMMAND, {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

async function checkClaudeCliAuthenticated(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    execSync('claude auth status', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

function initializeDatabase(dbPath: string): void {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assigned_to TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
  `);

  db.close();
}

export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = process.cwd();

  header('Claude Team Initialization');

  if (isClaudeTeamProject(cwd)) {
    fatal(
      'This directory is already a claude-team project.',
      'Remove .claude-team/ directory to re-initialize.'
    );
  }

  const checkSpinner = spinner('Checking prerequisites');

  const isInstalled = await checkClaudeCliInstalled();
  if (!isInstalled) {
    checkSpinner.fail();
    error('Claude CLI is not installed');
    info('Install it from: https://claude.ai/cli');
    process.exit(1);
  }

  const isAuthenticated = await checkClaudeCliAuthenticated();
  if (!isAuthenticated) {
    checkSpinner.fail();
    error('Claude CLI is not authenticated');
    info('Run: claude auth login');
    process.exit(1);
  }

  checkSpinner.succeed('Prerequisites checked');

  const projectName = options.name ?? basename(cwd);
  const autonomyMode = options.autonomy ?? 'supervised';

  section('Configuration');
  info(`Project name: ${projectName}`);
  info(`Autonomy mode: ${autonomyMode}`);

  const setupSpinner = spinner('Creating project structure');

  try {
    createDefaultConfig(projectName, autonomyMode, cwd);

    const dbPath = getDatabasePath(cwd);
    if (!existsSync(dbPath)) {
      initializeDatabase(dbPath);
    }

    setupSpinner.succeed('Project structure created');

    section('Next Steps');
    list([
      'Run "claude-team status" to see project status',
      'Run "claude-team doctor" to verify installation',
      'Check .claude-team/config.json to customize settings',
    ]);

    success('Project initialized successfully!');
  } catch (err) {
    setupSpinner.fail();
    const errorMessage = err instanceof Error ? err.message : String(err);
    fatal('Failed to initialize project', errorMessage);
  }
}
