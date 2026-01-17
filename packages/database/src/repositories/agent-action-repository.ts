import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { DrizzleClient } from '../client.js';
import {
  agentActions,
  type AgentAction,
  type NewAgentAction,
} from '../schema/agent-actions.js';
import { BaseRepository } from './base-repository.js';

export class AgentActionRepository extends BaseRepository<
  typeof agentActions,
  AgentAction,
  NewAgentAction
> {
  constructor(db: DrizzleClient) {
    super(db, agentActions, agentActions.id);
  }

  /**
   * Creates a new agent action with auto-generated ID.
   */
  async createAction(
    data: Omit<NewAgentAction, 'id' | 'createdAt'>
  ): Promise<AgentAction> {
    return this.create({
      ...data,
      id: nanoid(),
    });
  }

  /**
   * Finds actions by task ID.
   */
  async findByTaskId(taskId: string): Promise<AgentAction[]> {
    return this._db
      .select()
      .from(agentActions)
      .where(eq(agentActions.taskId, taskId))
      .orderBy(desc(agentActions.createdAt));
  }

  /**
   * Finds actions by project ID.
   */
  async findByProjectId(projectId: string): Promise<AgentAction[]> {
    return this._db
      .select()
      .from(agentActions)
      .where(eq(agentActions.projectId, projectId))
      .orderBy(desc(agentActions.createdAt));
  }

  /**
   * Finds actions by agent ID.
   */
  async findByAgentId(agentId: string): Promise<AgentAction[]> {
    return this._db
      .select()
      .from(agentActions)
      .where(eq(agentActions.agentId, agentId))
      .orderBy(desc(agentActions.createdAt));
  }

  /**
   * Finds actions requiring approval.
   */
  async findPendingApprovals(projectId?: string): Promise<AgentAction[]> {
    const conditions = [
      eq(agentActions.approvalRequired, true),
      eq(agentActions.approvalStatus, 'pending'),
    ];

    if (projectId) {
      conditions.push(eq(agentActions.projectId, projectId));
    }

    return this._db
      .select()
      .from(agentActions)
      .where(and(...conditions))
      .orderBy(desc(agentActions.createdAt));
  }

  /**
   * Approves an action.
   */
  async approveAction(id: string): Promise<AgentAction | undefined> {
    return this.update(id, {
      approvalStatus: 'approved',
      approvedAt: new Date(),
    });
  }

  /**
   * Rejects an action.
   */
  async rejectAction(id: string): Promise<AgentAction | undefined> {
    return this.update(id, {
      approvalStatus: 'rejected',
      approvedAt: new Date(),
    });
  }

  /**
   * Finds actions by type.
   */
  async findByActionType(
    actionType: string,
    projectId?: string
  ): Promise<AgentAction[]> {
    const conditions = [eq(agentActions.actionType, actionType)];

    if (projectId) {
      conditions.push(eq(agentActions.projectId, projectId));
    }

    return this._db
      .select()
      .from(agentActions)
      .where(and(...conditions))
      .orderBy(desc(agentActions.createdAt));
  }

  /**
   * Records action completion with duration.
   */
  async completeAction(
    id: string,
    output: unknown,
    durationMs: number
  ): Promise<AgentAction | undefined> {
    return this.update(id, {
      output: output as Record<string, unknown>,
      durationMs,
    });
  }
}
