# @claude-team/database

SQLite database access layer for claude-team using Drizzle ORM.

## Features

- Type-safe database access with Drizzle ORM
- Repository pattern for clean data access
- WAL mode enabled for better concurrent access
- Foreign key constraints enforced
- Comprehensive schema for workspaces, projects, events, tasks, and more

## Installation

```bash
npm install
```

## Usage

### Creating a Database Client

```typescript
import { createDatabaseClient } from '@claude-team/database';

const db = createDatabaseClient({
  path: './data/claude-team.db',
  readonly: false,
  verbose: false,
});
```

### Using Repositories

```typescript
import { WorkspaceRepository, ProjectRepository } from '@claude-team/database';

const workspaceRepo = new WorkspaceRepository(db);
const projectRepo = new ProjectRepository(db);

// Create a workspace
const workspace = await workspaceRepo.createWorkspace({
  name: 'My Workspace',
  path: '/path/to/workspace',
});

// Create a project
const project = await projectRepo.createProject({
  workspaceId: workspace.id,
  name: 'My Project',
  path: '/path/to/project',
  autonomyMode: 'supervised',
});

// Find projects in workspace
const projects = await projectRepo.findByWorkspaceId(workspace.id);
```

### Running Migrations

```typescript
import { migrate } from '@claude-team/database';

await migrate(db);
```

## Available Repositories

- `WorkspaceRepository` - Workspace management
- `ProjectRepository` - Project management
- `EventRepository` - Event tracking and processing
- `TaskRepository` - Task lifecycle management
- `AgentActionRepository` - Agent action tracking and approval

## Schema

### Workspaces
Represents development workspaces.

### Projects
Projects within workspaces with autonomy configuration.

### Agent Configs
Per-project agent configuration and trust levels.

### Events
System events for file changes, agent actions, etc.

### Tasks
Hierarchical task management with status tracking.

### Agent Actions
Detailed logging of agent actions with approval workflow.

### Decisions
Records of agent decision-making processes.

### File Index
Indexed file metadata for quick lookups.

## Scripts

- `npm run build` - Build the package
- `npm run dev` - Build in watch mode
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run typecheck` - Type check without emitting
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes

## Architecture

The package follows a clean repository pattern:

```
src/
├── client.ts              # Database client setup
├── schema/               # Drizzle schema definitions
│   ├── workspaces.ts
│   ├── projects.ts
│   └── ...
├── repositories/         # Data access repositories
│   ├── base-repository.ts
│   ├── workspace-repository.ts
│   └── ...
└── migrations/           # Database migrations
    └── 0001_initial.ts
```

Each repository extends `BaseRepository` which provides standard CRUD operations. Repositories add domain-specific query methods.

## Development

The package uses:
- TypeScript 5.7
- Drizzle ORM 0.38
- better-sqlite3 11.6
- Vitest for testing
- ESLint for linting
