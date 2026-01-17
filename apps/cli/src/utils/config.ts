/**
 * Config Utilities
 * Configuration file management helpers
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { ClaudeTeamConfig, AutonomyMode } from '../types.js';

const CONFIG_DIR = '.claude-team';
const CONFIG_FILE = 'config.json';
const DB_FILE = 'data.db';

const DEFAULT_CONFIG: ClaudeTeamConfig = {
  name: 'my-project',
  autonomyMode: 'supervised',
  agents: {
    'product-manager': { enabled: true, trustLevel: 'medium' },
    architect: { enabled: true, trustLevel: 'high' },
    frontend: { enabled: true, trustLevel: 'medium' },
    backend: { enabled: true, trustLevel: 'medium' },
    qa: { enabled: true, trustLevel: 'medium' },
    devops: { enabled: true, trustLevel: 'medium' },
    'tech-writer': { enabled: true, trustLevel: 'low' },
  },
};

export function getConfigDir(cwd: string = process.cwd()): string {
  return join(cwd, CONFIG_DIR);
}

export function getConfigPath(cwd: string = process.cwd()): string {
  return join(getConfigDir(cwd), CONFIG_FILE);
}

export function getDatabasePath(cwd: string = process.cwd()): string {
  return join(getConfigDir(cwd), DB_FILE);
}

export function isClaudeTeamProject(cwd: string = process.cwd()): boolean {
  return existsSync(getConfigPath(cwd));
}

export function requireClaudeTeamProject(
  cwd: string = process.cwd()
): string | never {
  if (!isClaudeTeamProject(cwd)) {
    throw new Error(
      'Not a claude-team project. Run "claude-team init" to initialize.'
    );
  }
  return getConfigDir(cwd);
}

export function createConfigDir(cwd: string = process.cwd()): string {
  const configDir = getConfigDir(cwd);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  return configDir;
}

export function readConfig(cwd: string = process.cwd()): ClaudeTeamConfig {
  const configPath = getConfigPath(cwd);
  if (!existsSync(configPath)) {
    throw new Error('Config file not found');
  }

  const content = readFileSync(configPath, 'utf-8');
  return JSON.parse(content) as ClaudeTeamConfig;
}

export function writeConfig(
  config: ClaudeTeamConfig,
  cwd: string = process.cwd()
): void {
  const configPath = getConfigPath(cwd);
  const content = JSON.stringify(config, null, 2);
  writeFileSync(configPath, content, 'utf-8');
}

export function createDefaultConfig(
  name: string,
  autonomyMode: AutonomyMode = 'supervised',
  cwd: string = process.cwd()
): ClaudeTeamConfig {
  const config: ClaudeTeamConfig = {
    ...DEFAULT_CONFIG,
    name,
    autonomyMode,
  };

  createConfigDir(cwd);
  writeConfig(config, cwd);

  return config;
}

export function updateConfig(
  updates: Partial<ClaudeTeamConfig>,
  cwd: string = process.cwd()
): ClaudeTeamConfig {
  const config = readConfig(cwd);
  const updatedConfig = { ...config, ...updates };
  writeConfig(updatedConfig, cwd);
  return updatedConfig;
}
