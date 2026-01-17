/**
 * CLI Types
 * Core type definitions for the CLI package
 */

export type AutonomyMode = 'supervised' | 'autonomous' | 'manual';

export type TrustLevel = 'low' | 'medium' | 'high';

export type AgentRole =
  | 'product-manager'
  | 'architect'
  | 'frontend'
  | 'backend'
  | 'qa'
  | 'devops'
  | 'tech-writer';

export interface AgentConfig {
  enabled: boolean;
  trustLevel: TrustLevel;
}

export interface ClaudeTeamConfig {
  name: string;
  autonomyMode: AutonomyMode;
  agents: Record<AgentRole, AgentConfig>;
}

export interface InitOptions {
  name?: string;
  autonomy?: AutonomyMode;
}

export interface ClaudeInstallation {
  installed: boolean;
  version?: string;
  authenticated: boolean;
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
}

export interface ProjectStatus {
  name: string;
  autonomyMode: AutonomyMode;
  agents: Array<{
    role: AgentRole;
    enabled: boolean;
    trustLevel: TrustLevel;
  }>;
  recentEvents: Array<{
    id: string;
    type: string;
    timestamp: Date;
    description: string;
  }>;
  pendingTasks: number;
}
