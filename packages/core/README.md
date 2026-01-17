# @claude-team/core

Core package for Claude Team - Agent orchestration and Claude CLI integration.

## Overview

This package provides the foundational infrastructure for the Claude Team project:

- **Agent System**: Load, register, and orchestrate specialized Claude agents from markdown definitions
- **Claude CLI Wrapper**: Spawn and manage Claude CLI processes with full stdio control
- **Event Bus**: Cross-agent communication via type-safe event system
- **Task Queue**: FIFO task queue with priority support and concurrent processing
- **Result Pattern**: Functional error handling without exceptions
- **Structured Logging**: Pino-based logging with metadata support

## Architecture

The package follows Clean Architecture principles with clear separation of concerns:

```
src/
├── shared/           # Core utilities (Result, Logger, types)
├── events/           # Event system (EventBus, EventEmitter)
├── tasks/            # Task management (TaskQueue, TaskProcessor)
├── claude/           # Claude CLI wrapper (check, spawn, process)
└── agents/           # Agent system (loader, orchestrator)
```

## Usage

### Agent System

Load and execute agents from markdown files with YAML frontmatter:

```typescript
import { loadAgentFromFile, getAgentOrchestrator } from '@claude-team/core';

// Load agent definition
const agentResult = await loadAgentFromFile('./agents/code-reviewer.md');
if (!agentResult.ok) {
  console.error('Failed to load agent:', agentResult.error);
  return;
}

// Register agent
const orchestrator = getAgentOrchestrator();
orchestrator.registerAgent(agentResult.value);

// Execute agent
const result = await orchestrator.executeAgent(
  agentResult.value.id,
  'Review the changes in PR #123',
  {
    projectId: 'my-project',
    workspaceId: 'workspace-1',
    cwd: '/path/to/project',
  }
);
```

### Claude CLI

Check installation and execute commands:

```typescript
import { getClaudeCli } from '@claude-team/core';

const cli = getClaudeCli();

// Check CLI installation and authentication
const checkResult = await cli.check();
if (!checkResult.ok) {
  console.error('Claude CLI not ready:', checkResult.error);
  return;
}

// Execute a command
const result = await cli.execute('Write a function to sort an array', {
  cwd: process.cwd(),
  systemPrompt: 'You are a helpful coding assistant',
  maxTurns: 5,
});
```

### Event Bus

Publish and subscribe to events:

```typescript
import { getEventBus } from '@claude-team/core';

const eventBus = getEventBus();

// Subscribe to events
eventBus.subscribe('git.push', (payload) => {
  console.log('Code pushed:', payload);
});

// Publish events
eventBus.publish({
  type: 'git.push',
  source: 'git-watcher',
  projectId: 'my-project',
  workspaceId: 'workspace-1',
  payload: { branch: 'main', commits: 3 },
});
```

### Task Queue

Create and process tasks:

```typescript
import { getTaskQueue, getTaskProcessor } from '@claude-team/core';

const queue = getTaskQueue();
const processor = getTaskProcessor();

// Register task handler
processor.register(async (task) => {
  console.log('Processing task:', task.title);
  // Execute task logic here
});

// Create task
const taskResult = queue.create({
  projectId: 'my-project',
  title: 'Review code',
  description: 'Review PR #123',
  priority: 10,
});

// Start processor
processor.start();
```

### Result Pattern

Handle errors functionally:

```typescript
import { success, failure, type Result } from '@claude-team/core';

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return failure({
      type: 'validation',
      message: 'Cannot divide by zero',
      fields: { divisor: 'must be non-zero' },
    });
  }
  return success(a / b);
}

const result = divide(10, 2);
if (result.ok) {
  console.log('Result:', result.value);
} else {
  console.error('Error:', result.error.message);
}
```

## Agent Definition Format

Agents are defined in markdown files with YAML frontmatter:

```markdown
---
id: code-reviewer
name: Code Reviewer
description: Reviews code changes and provides feedback
trustLevel: medium
maxTurns: 10
allowedTools:
  - Read
  - Grep
  - Bash
triggers:
  - event: git.push
    action: review_changes
  - event: pr.opened
    action: review_pr
context:
  - CONTRIBUTING.md
  - CODE_STYLE.md
---

You are a senior code reviewer. Your role is to:

1. Review code changes for quality, correctness, and style
2. Identify potential bugs and security issues
3. Suggest improvements and best practices
4. Ensure code follows project conventions

Always be constructive and educational in your feedback.
```

## Types

### AgentDefinition

```typescript
interface AgentDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly triggers: readonly AgentTrigger[];
  readonly trustLevel: 'low' | 'medium' | 'high' | 'full';
  readonly maxTurns: number;
  readonly allowedTools?: readonly string[];
  readonly context?: readonly string[];
  readonly systemPrompt: string;
}
```

### Event

```typescript
interface Event {
  readonly id: string;
  readonly type: string;
  readonly source: string;
  readonly timestamp: Date;
  readonly payload: Record<string, unknown>;
  readonly projectId: string;
  readonly workspaceId: string;
}
```

### Task

```typescript
interface Task {
  readonly id: string;
  readonly projectId: string;
  readonly agentId?: string;
  readonly title: string;
  readonly description?: string;
  readonly status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'canceled';
  readonly priority: number;
  readonly parentId?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata?: Record<string, unknown>;
}
```

### Result

```typescript
type Result<T, E = Failure> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test
```

## License

Private - Internal use only
