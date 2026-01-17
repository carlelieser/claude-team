# @claude-team/cli

Command-line interface for Claude Team.

## Installation

This package is part of the Claude Team monorepo and should be built with the workspace.

```bash
pnpm install
pnpm build
```

## Usage

### Initialize a Project

```bash
claude-team init [options]

Options:
  -n, --name <name>           Project name
  -a, --autonomy <mode>       Autonomy mode (supervised|autonomous|manual)
```

### Check Project Status

```bash
claude-team status
```

Shows:

- Project name and configuration
- Enabled/disabled agents
- Recent activity
- Pending tasks

### Health Check

```bash
claude-team doctor
```

Verifies:

- Claude CLI installation
- Claude CLI authentication
- Project configuration
- Database integrity

## Directory Structure

```
apps/cli/
├── src/
│   ├── index.ts              # Entry point
│   ├── cli.ts                # Commander.js setup
│   ├── types.ts              # TypeScript types
│   ├── commands/             # Command implementations
│   │   ├── init.ts
│   │   ├── status.ts
│   │   └── doctor.ts
│   └── utils/                # Utility functions
│       ├── output.ts         # Console formatting
│       └── config.ts         # Config management
├── package.json
└── tsconfig.json
```

## Development

```bash
# Build
pnpm build

# Development mode with watch
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Architecture

The CLI follows clean architecture principles:

- **Commands Layer**: User-facing command implementations
- **Utils Layer**: Reusable utilities for config, output, etc.
- **Types Layer**: TypeScript type definitions

### Error Handling

- Uses consistent error messaging patterns
- Provides helpful hints for common issues
- Exits with appropriate status codes

### Output Formatting

- Uses chalk for colored output
- Uses ora for spinners during async operations
- Consistent formatting across all commands

## Configuration

Projects are initialized with `.claude-team/config.json`:

```json
{
  "name": "project-name",
  "autonomyMode": "supervised",
  "agents": {
    "product-manager": { "enabled": true, "trustLevel": "medium" },
    "architect": { "enabled": true, "trustLevel": "high" },
    "frontend": { "enabled": true, "trustLevel": "medium" },
    "backend": { "enabled": true, "trustLevel": "medium" },
    "qa": { "enabled": true, "trustLevel": "medium" },
    "devops": { "enabled": true, "trustLevel": "medium" },
    "tech-writer": { "enabled": true, "trustLevel": "low" }
  }
}
```

## Database

SQLite database at `.claude-team/data.db` with tables:

- `events` - Event log
- `tasks` - Task tracking
- `decisions` - Decision tracking
