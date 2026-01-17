# Changelog

All notable changes to the @claude-team/database package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-16

### Added

- Initial package setup with Drizzle ORM and better-sqlite3
- Comprehensive schema definitions for all entities:
  - Workspaces
  - Projects
  - Agent Configs
  - Events
  - Tasks
  - Agent Actions
  - Decisions
  - File Index
- Repository pattern implementation:
  - BaseRepository with common CRUD operations
  - WorkspaceRepository
  - ProjectRepository
  - EventRepository
  - TaskRepository
  - AgentActionRepository
- Database client with optimized SQLite configuration:
  - WAL mode for concurrent access
  - 64MB cache size
  - Memory-mapped I/O
  - Foreign key constraints enforced
- Type utilities for Result pattern and common types
- Initial migration script
- Comprehensive test suite foundation
- Example usage documentation
- Full TypeScript support with strict type checking

### Configuration

- TypeScript 5.7 with strict mode
- ESLint with strict type checking rules
- Vitest for testing
- Drizzle Kit for migrations
- TSUP for building

### Documentation

- Complete README with usage examples
- API documentation with JSDoc
- Example usage file
- Test examples
