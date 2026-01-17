/**
 * Doctor Command
 * Check system health and installation
 */

import { existsSync } from 'fs';
import Database from 'better-sqlite3';
import type { ClaudeInstallation, HealthCheckResult } from '../types.js';
import {
  getDatabasePath,
  getConfigPath,
  isClaudeTeamProject,
  readConfig,
} from '../utils/config.js';
import {
  divider,
  error,
  green,
  header,
  info,
  red,
  section,
  success,
  warning,
  yellow,
} from '../utils/output.js';

async function checkClaudeCli(): Promise<ClaudeInstallation> {
  const installation: ClaudeInstallation = {
    installed: false,
    authenticated: false,
  };

  try {
    const { execSync } = await import('child_process');

    const path = execSync('which claude', {
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();

    if (path) {
      installation.installed = true;

      try {
        const version = execSync('claude --version', {
          encoding: 'utf-8',
          stdio: 'pipe',
        }).trim();
        installation.version = version;
      } catch {
        installation.version = 'unknown';
      }

      try {
        execSync('claude auth status', {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
        installation.authenticated = true;
      } catch {
        installation.authenticated = false;
      }
    }
  } catch {
    installation.installed = false;
  }

  return installation;
}

function checkProjectSetup(cwd: string): HealthCheckResult[] {
  const results: HealthCheckResult[] = [];

  if (!isClaudeTeamProject(cwd)) {
    results.push({
      name: 'Project Setup',
      status: 'fail',
      message: 'Not a claude-team project',
      details: 'Run "claude-team init" to initialize',
    });
    return results;
  }

  const configPath = getConfigPath(cwd);
  if (existsSync(configPath)) {
    results.push({
      name: 'Config File',
      status: 'pass',
      message: 'Configuration file exists',
    });

    try {
      readConfig(cwd);
      results.push({
        name: 'Config Valid',
        status: 'pass',
        message: 'Configuration is valid',
      });
    } catch {
      results.push({
        name: 'Config Valid',
        status: 'fail',
        message: 'Configuration is invalid',
        details: 'Check .claude-team/config.json for syntax errors',
      });
    }
  } else {
    results.push({
      name: 'Config File',
      status: 'fail',
      message: 'Configuration file missing',
    });
  }

  const dbPath = getDatabasePath(cwd);
  if (existsSync(dbPath)) {
    results.push({
      name: 'Database File',
      status: 'pass',
      message: 'Database file exists',
    });

    try {
      const db = new Database(dbPath, { readonly: true });

      const tables = db
        .prepare(
          `
        SELECT name FROM sqlite_master
        WHERE type='table' AND name IN ('events', 'tasks', 'decisions')
      `
        )
        .all() as Array<{ name: string }>;

      if (tables.length === 3) {
        results.push({
          name: 'Database Schema',
          status: 'pass',
          message: 'All required tables exist',
        });
      } else {
        results.push({
          name: 'Database Schema',
          status: 'warn',
          message: 'Some tables are missing',
          details: `Found ${tables.length}/3 tables`,
        });
      }

      db.close();
    } catch (err) {
      results.push({
        name: 'Database Schema',
        status: 'fail',
        message: 'Could not read database',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  } else {
    results.push({
      name: 'Database File',
      status: 'fail',
      message: 'Database file missing',
    });
  }

  return results;
}

function displayHealthCheck(name: string, result: HealthCheckResult): void {
  const icon = result.status === 'pass' ? green('✓') : result.status === 'warn' ? yellow('⚠') : red('✗');
  const message =
    result.status === 'pass'
      ? green(result.message)
      : result.status === 'warn'
        ? yellow(result.message)
        : red(result.message);

  console.log(`  ${icon} ${name}: ${message}`);

  if (result.details) {
    console.log(`    ${yellow(result.details)}`);
  }
}

export async function doctorCommand(): Promise<void> {
  header('Claude Team Health Check');

  section('Claude CLI');

  const claudeInstallation = await checkClaudeCli();

  if (claudeInstallation.installed) {
    success(
      `Claude CLI installed ${claudeInstallation.version ? `(${claudeInstallation.version})` : ''}`
    );

    if (claudeInstallation.authenticated) {
      success('Claude CLI authenticated');
    } else {
      error('Claude CLI not authenticated');
      info('Run: claude auth login');
    }
  } else {
    error('Claude CLI not installed');
    info('Install from: https://claude.ai/cli');
  }

  section('Project Setup');

  const projectChecks = checkProjectSetup(process.cwd());
  projectChecks.forEach((check) => {
    displayHealthCheck(check.name, check);
  });

  divider();

  const hasFails = projectChecks.some((c) => c.status === 'fail');
  const hasWarns = projectChecks.some((c) => c.status === 'warn');

  if (!claudeInstallation.installed || !claudeInstallation.authenticated) {
    console.log();
    warning('Claude CLI issues detected');
    process.exit(1);
  } else if (hasFails) {
    console.log();
    error('Health check failed');
    process.exit(1);
  } else if (hasWarns) {
    console.log();
    warning('Health check completed with warnings');
  } else {
    console.log();
    success('All checks passed!');
  }
}
