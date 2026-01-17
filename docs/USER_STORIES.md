# Claude Team - User Stories

## Target User

**Solo Developer**: A single developer who wants to leverage AI agents to handle the breadth of software development tasks typically requiring a full team.

## Vision

Claude Team is a **task orchestration layer** on top of Claude CLI. It manages tasks, coordinates agents, and handles approvals—Claude CLI handles all code understanding and generation.

---

## Core User Stories

### 1. Quick Start

| ID | Story | Success Criteria |
|----|-------|------------------|
| QS-1 | As a solo dev, I want to start a new project with one command so I can begin immediately | `claude-team init` creates project config with working defaults in < 5 seconds |
| QS-2 | As a solo dev, I want to register my existing codebase so I can assign tasks to it | `claude-team import <path>` registers project in database, completes in < 5 seconds |
| QS-3 | As a solo dev, I want the app to verify Claude CLI is ready so I don't hit errors later | `claude-team doctor` checks installation, auth, and version; provides clear fix instructions if issues found |

### 2. Tray Interface

| ID | Story | Success Criteria |
|----|-------|------------------|
| TR-1 | As a solo dev, I want the app in my system tray so it's always accessible without clutter | Tray icon visible; click opens quick menu |
| TR-2 | As a solo dev, I want to see at a glance if agents are working or need my attention | Icon states: idle (outline), working (animated), needs attention (dot), error (x) |
| TR-3 | As a solo dev, I want to create tasks quickly without opening the full dashboard | "New Task" menu item opens minimal input popup; accepts natural language |
| TR-4 | As a solo dev, I want notifications when agents complete work or need approval | System notifications for task completion, approval requests, and errors |

### 3. Task Management

| ID | Story | Success Criteria |
|----|-------|------------------|
| TM-1 | As a solo dev, I want to describe what I need in plain English and have it become a task | `claude-team task "description"` creates task and routes to appropriate agent |
| TM-2 | As a solo dev, I want to see all tasks and their status | `claude-team task list` shows tasks with status: pending, in_progress, completed, failed |
| TM-3 | As a solo dev, I want to cancel a task if I change my mind | `claude-team task cancel <id>` stops the task and cleans up |
| TM-4 | As a solo dev, I want tasks processed in priority order | Tasks with higher priority processed first; FIFO within same priority |

### 4. Agent Orchestration

| ID | Story | Success Criteria |
|----|-------|------------------|
| AO-1 | As a solo dev, I want a Product Manager agent to turn my ideas into requirements | Agent outputs structured user stories with acceptance criteria |
| AO-2 | As a solo dev, I want an Architect agent to design before coding starts | Agent outputs architecture diagrams (mermaid), module definitions, and ADRs |
| AO-3 | As a solo dev, I want Frontend/Backend agents for domain-specific implementation | Agents generate idiomatic code respecting layer boundaries |
| AO-4 | As a solo dev, I want a QA agent to write tests for new code | Agent generates tests, identifies edge cases, reports coverage |
| AO-5 | As a solo dev, I want a DevOps agent to handle CI/CD configuration | Agent generates pipeline configs, deployment scripts |
| AO-6 | As a solo dev, I want a Tech Writer agent to keep docs current | Agent updates README, API docs, and decision records |
| AO-7 | As a solo dev, I want to see what each agent is doing right now | `claude-team agent status` shows active agents with current task and progress |

### 5. Event-Driven Workflow

| ID | Story | Success Criteria |
|----|-------|------------------|
| EV-1 | As a solo dev, I want agents to react automatically to relevant changes | Code changes trigger QA; new requirements trigger Architect; API changes trigger Tech Writer |
| EV-2 | As a solo dev, I want to see the event stream to understand what's happening | `claude-team events` streams events in real-time; filterable by type |
| EV-3 | As a solo dev, I want events persisted so I can replay or audit later | Events stored in SQLite; queryable by time, type, source |

### 6. Autonomy Control

| ID | Story | Success Criteria |
|----|-------|------------------|
| AC-1 | As a solo dev, I want to choose how much agents can do without asking me | Three modes: autonomous, supervised, collaborative |
| AC-2 | As a solo dev, I want to set trust levels per agent | Trust levels (low/medium/high/full) control which actions need approval |
| AC-3 | As a solo dev, I want to approve or reject proposed changes | Approval queue; `claude-team approve/reject <id>`; diff view in dashboard |
| AC-4 | As a solo dev, I want to pause all agents when I need focus time | `claude-team agent pause` stops all processing; `resume` continues |

### 7. Transparency

| ID | Story | Success Criteria |
|----|-------|------------------|
| TP-1 | As a solo dev, I want to see why an agent made each decision | Decision log with rationale, alternatives considered, confidence score |
| TP-2 | As a solo dev, I want a complete audit trail of all agent actions | Action log with: agent, action type, target, input/output, reasoning, timestamp |
| TP-3 | As a solo dev, I want to review diffs before changes are applied | Dashboard shows unified diff; approve/reject/modify options |

### 8. Code Quality

| ID | Story | Success Criteria |
|----|-------|------------------|
| CQ-1 | As a solo dev, I want agents to follow my project's CLAUDE.md rules | Agents read and apply CLAUDE.md conventions; violations flagged |
| CQ-2 | As a solo dev, I want generated code to pass lint and type checks | All agent-generated code passes `tsc --noEmit` and `eslint` |
| CQ-3 | As a solo dev, I want tests written alongside implementation | New code includes corresponding tests; configurable coverage threshold |

### 9. Dashboard

| ID | Story | Success Criteria |
|----|-------|------------------|
| DB-1 | As a solo dev, I want an overview of project health and agent activity | Dashboard `/` shows: active tasks, agent status, recent events |
| DB-2 | As a solo dev, I want a task board to visualize work | Dashboard `/tasks` shows kanban or list view with drag-drop |
| DB-3 | As a solo dev, I want to search across events, actions, and decisions | Search bar filters across all logged data |
| DB-4 | As a solo dev, I want real-time updates without refreshing | Dashboard updates via IPC as events occur |

### 10. CLI Parity

| ID | Story | Success Criteria |
|----|-------|------------------|
| CLI-1 | As a solo dev, I want full functionality via CLI for scripting | Every tray/dashboard action available via `claude-team` commands |
| CLI-2 | As a solo dev, I want an interactive mode for exploration | `claude-team` (no args) starts REPL with autocomplete |
| CLI-3 | As a solo dev, I want to stream events in my terminal | `claude-team events` works like `tail -f`; Ctrl+C exits cleanly |

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Time to first productive use | < 5 minutes |
| Typical agent response time | < 30 seconds |
| Code quality | Passes lint + type check + tests |
| Action traceability | 100% of actions have reasoning logged |
| Task failure rate | < 1% requiring manual intervention |
| Works offline | Yes, after initial setup |
| Data stays local | No code leaves machine unless configured |

---

## Out of Scope (v1)

- Cloud sync / multi-device
- Team collaboration
- Custom agent creation UI
- Mobile companion
- Real-time pair programming

---

## Story Map Summary

```
Quick Start ─────► Register Project ─────► Describe Feature ─────► Agents Work ─────► Review & Approve ─────► Ship
     │                   │                       │                      │                    │
     ▼                   ▼                       ▼                      ▼                    ▼
  Tray Icon         Project Config          PM Agent              Event-driven          Audit Trail
  Doctor Check      Agent Settings          Architect             Coordination          Decision Log
  Defaults                                  Frontend/Backend      Progress Updates      Diff Review
                                            QA/DevOps/Writer      Autonomy Control      Quality Gates
```
