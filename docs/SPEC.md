# Claude Team - Technical Specification

## Overview

**Claude Team** is an Electron tray-based application with full CLI parity that orchestrates multiple AI agents to function as a complete software development team for solo developers.

### Vision

Provide a lightweight orchestration layer on top of Claude CLI. Claude Team **manages tasks and coordinates agents**—it does not duplicate Claude's capabilities for understanding code, reading files, or analyzing projects.

### Scope

**In Scope:**
- Task orchestration (queue, prioritize, assign)
- Agent lifecycle management (spawn, monitor, cancel)
- Event-driven workflows (triggers, subscriptions)
- Approval workflows (trust levels, user consent)
- User interfaces (tray, dashboard, CLI)
- Persistence (tasks, events, decisions, actions)

**Out of Scope (delegated to Claude CLI):**
- Codebase indexing and understanding
- File reading, writing, editing
- Tech stack detection
- Symbol extraction and analysis
- All AI reasoning and code generation

### Key Characteristics

| Aspect            | Decision                           |
|-------------------|------------------------------------|
| Name              | `claude-team`                      |
| Primary Interface | Electron tray app + CLI            |
| Frontend Stack    | Svelte + TypeScript                |
| Database          | SQLite (local)                     |
| AI Backend        | Claude CLI via child process stdio |
| Target User       | Solo developers                    |
| MVP Scope         | Full feature set (all 7 agents)    |

---

## System Architecture

### High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Team App                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Tray UI   │  │  Dashboard  │  │          CLI            │  │
│  │  (Popup)    │  │  (Window)   │  │                         │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                     │                │
│         └────────────────┼─────────────────────┘                │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Core Services                          │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │
│  │  │   Agent     │ │   Event     │ │      Project        │  │  │
│  │  │ Orchestrator│ │    Bus      │ │      Manager        │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │  │
│  │  ┌─────────────┐ ┌─────────────────────────────────────┐  │  │
│  │  │   Task      │ │       Approval Service              │  │  │
│  │  │   Queue     │ │                                     │  │  │
│  │  └─────────────┘ └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Data Layer                             │  │
│  │  ┌─────────────────────────────┐ ┌─────────────────────┐  │  │
│  │  │          SQLite             │ │    File System      │  │  │
│  │  │         Database            │ │    (Projects)       │  │  │
│  │  └─────────────────────────────┘ └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Claude CLI Process Layer                   │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              claude (child process)                 │  │  │
│  │  │                                                     │  │  │
│  │  │  • Spawned per agent task via child_process.spawn  │  │  │
│  │  │  • Communication via stdio (stdin/stdout/stderr)   │  │  │
│  │  │  • Inherits all Claude Code capabilities           │  │  │
│  │  │  • System prompt injected via --system-prompt flag │  │  │
│  │  │  • Project context via --cwd flag                  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```text
claude-team/
├── apps/
│   ├── electron/              # Electron main process
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── tray.ts
│   │   │   ├── windows.ts
│   │   │   └── ipc/
│   │   └── package.json
│   ├── web/                   # Svelte frontend (dashboard)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── components/
│   │   │   └── stores/
│   │   └── package.json
│   └── cli/                   # CLI application
│       ├── src/
│       │   ├── commands/
│       │   └── index.ts
│       └── package.json
├── packages/
│   ├── core/                  # Shared core logic
│   │   ├── src/
│   │   │   ├── agents/        # Agent orchestration & Claude CLI spawning
│   │   │   ├── events/        # Event bus implementation
│   │   │   ├── projects/      # Project & workspace management
│   │   │   └── tasks/         # Task queue processing
│   │   └── package.json
│   └── database/              # SQLite schemas and repositories
│       ├── src/
│       │   ├── schema/
│       │   ├── repositories/
│       │   └── migrations/
│       └── package.json
├── agents/                    # Agent prompt definitions (markdown)
│   ├── product-manager.md
│   ├── architect.md
│   ├── frontend.md
│   ├── backend.md
│   ├── qa.md
│   ├── devops.md
│   └── tech-writer.md
├── package.json               # Monorepo root
├── pnpm-workspace.yaml
└── turbo.json
```

### Technology Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| Monorepo      | pnpm workspaces + Turborepo           |
| Electron      | Electron 28+                          |
| Frontend      | Svelte 5 + SvelteKit                  |
| Styling       | Tailwind CSS                          |
| Database      | SQLite via better-sqlite3             |
| ORM           | Drizzle ORM                           |
| CLI           | Commander.js                          |
| AI Backend    | Claude CLI (spawned as child process) |
| Testing       | Vitest                                |
| Build         | tsup / Vite                           |

### Claude CLI Integration

Agents execute via the Claude CLI (`claude`) spawned as child processes:

```typescript
import { spawn } from 'child_process';

interface ClaudeProcessOptions {
  cwd: string;                    // Project working directory
  systemPrompt: string;           // Agent's system prompt (from markdown)
  allowedTools?: string[];        // Tool restrictions (optional)
  maxTurns?: number;              // Limit agent iterations
  timeout?: number;               // Process timeout in ms
}

interface ClaudeProcess {
  // Spawn a new Claude CLI process
  spawn(options: ClaudeProcessOptions): ChildProcess;

  // Send a message to the process via stdin
  send(message: string): void;

  // Stream stdout/stderr for progress updates
  onOutput(callback: (chunk: string) => void): void;

  // Handle process completion
  onComplete(callback: (result: ClaudeResult) => void): void;

  // Kill the process (for cancellation)
  kill(): void;
}
```

**Spawning an Agent:**

```bash
claude \
  --print \
  --output-format stream-json \
  --system-prompt "$(cat agents/architect.md)" \
  --allowedTools "Read,Write,Edit,Glob,Grep,Bash" \
  --max-turns 50 \
  --cwd /path/to/project \
  "Design the authentication module for this application"
```

**Benefits of Claude CLI approach:**
- Inherits all Claude Code capabilities (tools, MCP, permissions)
- No API key management needed (Claude CLI handles auth)
- Process isolation per agent task
- Native cancellation via process signals
- Streaming output for real-time progress
- Consistent behavior with standalone Claude Code

---

## Agent System

### Agent Definition Format

Agents are defined as Markdown files with YAML frontmatter. The Markdown body becomes the system prompt passed to Claude CLI:

```markdown
---
id: architect
name: Architect
description: Designs system architecture and makes technical decisions

# Event triggers - when these events occur, this agent is invoked
triggers:
  - event: requirement.created
    action: review_and_design
  - event: feature.requested
    action: propose_architecture

# Trust level controls approval requirements
trustLevel: high              # low | medium | high | full

# Claude CLI options
maxTurns: 50                  # Max agent iterations per task
allowedTools:                 # Restrict available tools (optional, all by default)
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash

# Files to include in agent's initial context
context:
  - CLAUDE.md
  - src/core/**/*.ts
---

# Architect Agent

You are a senior software architect with 15+ years of experience designing scalable, maintainable software systems.

## Responsibilities

1. Review requirements and identify technical implications
2. Design system architecture following clean architecture principles
3. Define module boundaries and interfaces
4. Make technology decisions with clear rationale
5. Create architecture decision records (ADRs)

## Guidelines

- Always consider scalability, maintainability, and testability
- Prefer composition to inheritance
- Design for change; minimize coupling between modules
- Document significant decisions with rationale

## Output Format

When proposing architecture, provide:
1. High-level component diagram (mermaid)
2. Module responsibilities
3. Interface definitions
4. Key technical decisions with alternatives considered
```

**Note:** The agent Markdown (minus frontmatter) is passed directly to Claude CLI via `--system-prompt`. All Claude Code tools are available by default unless restricted via `allowedTools`.

### Agent Roles

| Agent               | Primary Responsibility                       | Key Triggers                     |
|---------------------|----------------------------------------------|----------------------------------|
| **Product Manager** | Translate ideas into structured requirements | User input, feature requests     |
| **Architect**       | System design, technical decisions           | New requirements, design reviews |
| **Frontend**        | UI/UX implementation                         | UI tasks, component requests     |
| **Backend**         | API, business logic, data layer              | API tasks, backend features      |
| **QA**              | Testing, quality assurance                   | Code changes, PR reviews         |
| **DevOps**          | CI/CD, infrastructure, deployment            | Config changes, release requests |
| **Tech Writer**     | Documentation maintenance                    | API changes, feature completion  |

### Agent Capabilities

Since agents run via Claude CLI, they inherit all Claude Code capabilities:

| Tool           | Description                    |
|----------------|--------------------------------|
| `Read`         | Read files from the filesystem |
| `Write`        | Create new files               |
| `Edit`         | Modify existing files          |
| `Glob`         | Find files by pattern          |
| `Grep`         | Search file contents           |
| `Bash`         | Execute shell commands         |
| `WebFetch`     | Fetch web content              |
| `WebSearch`    | Search the web                 |
| `Task`         | Spawn subagents                |
| `NotebookEdit` | Edit Jupyter notebooks         |
| `MCP`          | Call MCP server tools          |

Tools can be restricted per-agent via the `allowedTools` frontmatter field.

### Trust Levels & Autonomy

| Trust Level | File Create | File Edit | File Delete | Shell Execute |
|-------------|-------------|-----------|-------------|---------------|
| `low`       | approve     | approve   | deny        | deny          |
| `medium`    | approve     | auto      | approve     | approve       |
| `high`      | auto        | auto      | approve     | approve       |
| `full`      | auto        | auto      | auto        | auto          |

**Autonomy Modes (Project-Level):**

| Mode            | Behavior                                                       |
|-----------------|----------------------------------------------------------------|
| `autonomous`    | Agents work independently, user notified of completions        |
| `supervised`    | Agents propose changes, user approves per trust level settings |
| `collaborative` | Agents wait for user input at each significant step            |

---

## Event System

### Event Bus Architecture

The event bus uses SQLite-backed persistence for durability and replay capability.

```typescript
interface Event {
  id: string;                    // UUID
  type: string;                  // e.g., "code.changed", "task.completed"
  source: string;                // Agent ID or "system" or "user"
  timestamp: Date;
  payload: Record<string, unknown>;
  projectId: string;
  workspaceId: string;
  processed: boolean;
  processedAt?: Date;
  processedBy?: string;          // Agent ID that handled it
}

interface EventSubscription {
  agentId: string;
  eventPattern: string;          // Glob pattern, e.g., "code.*"
  action: string;                // Action name from agent config
  priority: number;
  enabled: boolean;
}
```

### Core Event Types

| Category        | Event                 | Payload                         |
|-----------------|-----------------------|---------------------------------|
| **Code**        | `code.file.created`   | `{ path, content }`             |
|                 | `code.file.modified`  | `{ path, diff }`                |
|                 | `code.file.deleted`   | `{ path }`                      |
| **Git**         | `git.commit`          | `{ hash, message, files }`      |
|                 | `git.push`            | `{ branch, commits }`           |
|                 | `git.branch.created`  | `{ name, from }`                |
| **Task**        | `task.created`        | `{ id, title, assignee }`       |
|                 | `task.started`        | `{ id, agentId }`               |
|                 | `task.completed`      | `{ id, result }`                |
|                 | `task.failed`         | `{ id, error }`                 |
| **Requirement** | `requirement.created` | `{ id, description }`           |
|                 | `requirement.updated` | `{ id, changes }`               |
| **Agent**       | `agent.started`       | `{ agentId, taskId }`           |
|                 | `agent.progress`      | `{ agentId, message, percent }` |
|                 | `agent.completed`     | `{ agentId, taskId, result }`   |
|                 | `agent.error`         | `{ agentId, error }`            |
| **User**        | `user.input`          | `{ message }`                   |
|                 | `user.approval`       | `{ actionId, approved }`        |

### Event Flow Example

```text
User describes feature
        │
        ▼
┌───────────────────┐
│  user.input       │──────────────────────────────────┐
└───────────────────┘                                  │
        │                                              │
        ▼                                              ▼
┌───────────────────┐                         ┌───────────────────┐
│ Product Manager   │                         │    Event Bus      │
│ (listening)       │                         │    (SQLite)       │
└───────────────────┘                         └───────────────────┘
        │
        ▼
┌───────────────────┐
│ requirement       │
│ .created          │
└───────────────────┘
        │
        ├──────────────────────────────┐
        ▼                              ▼
┌───────────────────┐         ┌───────────────────┐
│    Architect      │         │    Tech Writer    │
│    (listening)    │         │    (listening)    │
└───────────────────┘         └───────────────────┘
        │
        ▼
┌───────────────────┐
│ architecture      │
│ .proposed         │
└───────────────────┘
        │
        ├────────────────┬─────────────────┐
        ▼                ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Frontend   │  │   Backend   │  │     QA      │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Data Model

### Database Schema

```sql
-- Workspaces contain multiple projects
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects within a workspace
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  autonomy_mode TEXT DEFAULT 'supervised',  -- autonomous | supervised | collaborative
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  config JSON
);

-- Agent configurations (overrides for project)
CREATE TABLE agent_configs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  agent_id TEXT NOT NULL,                    -- References agent Markdown file
  enabled BOOLEAN DEFAULT true,
  trust_level TEXT DEFAULT 'medium',
  max_turns INTEGER DEFAULT 50,              -- Claude CLI --max-turns
  allowed_tools JSON,                        -- Tool restrictions (null = all)
  config JSON,                               -- Additional config overrides
  UNIQUE(project_id, agent_id)
);

-- Event log (SQLite-backed event bus)
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  payload JSON NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_by TEXT,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_processed ON events(processed, created_at);

-- Task queue (FIFO)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  agent_id TEXT,                             -- Assigned agent (null = unassigned)
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',             -- pending | in_progress | completed | failed | canceled
  priority INTEGER DEFAULT 0,
  parent_id TEXT REFERENCES tasks(id),       -- For subtasks
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  result JSON,
  error TEXT
);

CREATE INDEX idx_tasks_status ON tasks(status, priority, created_at);

-- Agent action log (for transparency/audit)
CREATE TABLE agent_actions (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  agent_id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id),
  action_type TEXT NOT NULL,                 -- file_read | file_write | shell_execute | etc.
  target TEXT,                               -- File path, command, etc.
  input JSON,
  output JSON,
  reasoning TEXT,                            -- Agent's explanation
  approval_required BOOLEAN DEFAULT false,
  approval_status TEXT,                      -- pending | approved | rejected
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_ms INTEGER
);

-- Decision log (architectural decisions, technical choices)
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  agent_id TEXT NOT NULL,
  task_id TEXT REFERENCES tasks(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  alternatives JSON,                         -- Array of considered alternatives
  rationale TEXT NOT NULL,
  confidence REAL,                           -- 0.0 - 1.0
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

```

**Note:** No provider/API key tables needed - Claude CLI handles its own authentication. Codebase indexing and understanding is delegated to Claude CLI.

---

## User Interface

### Tray Application

**Tray Icon States:**
| State | Icon | Meaning |
|-------|------|---------|
| Idle | ○ (outline) | No active tasks |
| Working | ● (filled, animated) | Agent(s) actively processing |
| Needs Attention | ◉ (dot inside) | Approval required or error |
| Error | ⊗ (x inside) | System error |

**Tray Menu:**
```text
┌─────────────────────────────┐
│ Claude Team                 │
├─────────────────────────────┤
│ ● 2 agents working          │
│   └ Architect: Designing... │
│   └ QA: Writing tests...    │
├─────────────────────────────┤
│ Current Project: my-app     │
│ ▸ Switch Project           →│
├─────────────────────────────┤
│ New Task...            ⌘N   │
│ View Dashboard         ⌘D   │
│ Pause All Agents       ⌘P   │
├─────────────────────────────┤
│ ▸ Recent Actions           →│
│ ▸ Pending Approvals (3)    →│
├─────────────────────────────┤
│ Preferences...         ⌘,   │
│ Quit                   ⌘Q   │
└─────────────────────────────┘
```

**Popup Window (Quick Input):**
- Appears on "New Task" or keyboard shortcut
- Simple text input for natural language commands
- Shows recent context
- Auto-suggests based on project state

### Dashboard (Full Window)

**Routes:**
| Route | Purpose |
|-------|---------|
| `/` | Overview: project status, agent activity, recent events |
| `/tasks` | Task board: kanban or list view of all tasks |
| `/agents` | Agent status: what each agent is doing, config |
| `/events` | Event stream: filterable log of all events |
| `/history` | Action history: audit log with reasoning |
| `/decisions` | Decision log: architectural decisions with rationale |
| `/settings` | Project and global settings |

**Dashboard Features:**
- Real-time updates via IPC/WebSocket
- Diff viewer for proposed changes
- Approval workflow UI
- Progress indicators with cancellation
- Search across events, actions, decisions

### CLI Interface

```bash
# Project management
claude-team init                    # Initialize new project
claude-team import <path>           # Import existing codebase
claude-team status                  # Show project status
claude-team switch <project>        # Switch active project

# Workspaces
claude-team workspace create <name> # Create workspace
claude-team workspace list          # List workspaces
claude-team workspace add <project> # Add project to workspace

# Tasks
claude-team task "description"      # Create task from description
claude-team task list               # List tasks
claude-team task status <id>        # Get task status
claude-team task cancel <id>        # Cancel task

# Agents
claude-team agent list              # List agents
claude-team agent status <id>       # Agent status
claude-team agent pause [id]        # Pause agent(s)
claude-team agent resume [id]       # Resume agent(s)

# Events
claude-team events                  # Stream events (tail -f style)
claude-team events --type code.*    # Filter by type
claude-team events --since 1h       # Since time

# Approvals
claude-team approve <id>            # Approve pending action
claude-team reject <id> [reason]    # Reject pending action
claude-team approvals               # List pending approvals

# Configuration
claude-team config get <key>        # Get config value
claude-team config set <key> <val>  # Set config value

# Claude CLI
claude-team doctor                  # Check Claude CLI installation & auth

# Interactive mode
claude-team                         # Start interactive REPL
```

---

## Security

### Prerequisites

Claude Team requires the Claude CLI to be installed and authenticated:

```bash
# Install Claude CLI (user must do this before using Claude Team)
npm install -g @anthropic-ai/claude-code

# Authenticate (one-time setup)
claude login
```

**Verification on startup:**
```typescript
interface ClaudeCliCheck {
  // Check if claude CLI is available in PATH
  isInstalled(): Promise<boolean>;

  // Check if claude is authenticated
  isAuthenticated(): Promise<boolean>;

  // Get claude version
  getVersion(): Promise<string>;
}
```

If Claude CLI is not installed or authenticated, the app should display setup instructions.

### Sandboxing

**Shell Command Restrictions:**
- Configurable allowed/blocked command patterns
- Working directory restricted to project path
- Environment variable filtering (no secret exposure)
- Timeout enforcement

**File System Restrictions:**
- Operations limited to project directory by default
- Explicit allowlist for external paths
- No access to system directories

---

## Performance & Reliability

### Task Processing

```typescript
interface TaskProcessor {
  // FIFO queue processing
  processNext(): Promise<void>;

  // Get queue depth
  queueDepth(): number;

  // Cancel running task
  cancel(taskId: string): Promise<void>;

  // Pause/resume processing
  pause(): void;
  resume(): void;
}
```

**Processing Rules:**
- One task per agent at a time
- FIFO order within priority level
- Graceful cancellation with cleanup
- Automatic retry on transient failures (with backoff)
- Dead letter queue for repeatedly failing tasks

### Progress & Cancellation

```typescript
interface TaskProgress {
  taskId: string;
  agentId: string;
  message: string;
  percent?: number;          // 0-100 if known
  stage?: string;            // Current stage name
  startedAt: Date;
  estimatedCompletion?: Date;
}

interface CancellationToken {
  isCanceled: boolean;
  onCancel(callback: () => void): void;
}
```

**Progress Streaming:**
- Agent emits progress events during execution
- UI subscribes to progress for specific tasks
- Cancellation propagates to agent, triggers cleanup

### Offline Support

- All data stored locally (SQLite + filesystem)
- Queue tasks for later execution if Claude CLI unavailable
- Clear indication of offline state in UI

---

## Configuration

### Global Configuration (`~/.claude-team/config.json`)

```json
{
  "theme": "system",
  "notifications": {
    "taskCompleted": true,
    "approvalRequired": true,
    "errors": true
  },
  "shortcuts": {
    "newTask": "CommandOrControl+Shift+N",
    "dashboard": "CommandOrControl+Shift+D"
  },
  "claude": {
    "maxTurns": 50,
    "timeout": 300000
  },
  "telemetry": false
}
```

### Project Configuration (`.claude-team/config.json`)

```json
{
  "name": "my-project",
  "workspaceId": "ws_123",
  "autonomyMode": "supervised",
  "agents": {
    "architect": {
      "enabled": true,
      "trustLevel": "high",
      "maxTurns": 100
    },
    "qa": {
      "enabled": true,
      "trustLevel": "medium",
      "allowedTools": ["Read", "Glob", "Grep", "Bash"]
    }
  },
  "shell": {
    "allowedCommands": ["npm", "pnpm", "yarn", "git", "node", "tsc"],
    "blockedPatterns": ["rm -rf /", "sudo *"]
  }
}
```
---

## Success Criteria

| Metric                        | Target                             |
|-------------------------------|------------------------------------|
| Time to first productive use  | < 5 minutes                        |
| Agent response time (typical) | < 30 seconds                       |
| Generated code quality        | Passes lint + type check + tests   |
| Action traceability           | 100% of actions have reasoning     |
| Task failure rate             | < 1% requiring manual intervention |
