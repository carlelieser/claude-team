import { eq, SQL } from 'drizzle-orm';
import type { DrizzleClient } from '../client.js';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';

/**
 * Base repository providing common CRUD operations.
 * All repositories should extend this class to inherit standard functionality.
 */
export abstract class BaseRepository<
  TTable extends SQLiteTable,
  TSelect = TTable['$inferSelect'],
  TInsert = TTable['$inferInsert']
> {
  constructor(
    protected readonly _db: DrizzleClient,
    protected readonly _table: TTable,
    protected readonly _idColumn: SQLiteColumn
  ) {}

  /**
   * Finds a record by ID.
   */
  async findById(id: string): Promise<TSelect | undefined> {
    const result = await this._db
      .select()
      .from(this._table)
      .where(eq(this._idColumn, id))
      .limit(1);
    return result[0] as TSelect | undefined;
  }

  /**
   * Finds all records matching the given condition.
   */
  async findMany(where?: SQL): Promise<TSelect[]> {
    if (where) {
      const result = await this._db.select().from(this._table).where(where);
      return result as TSelect[];
    }
    const result = await this._db.select().from(this._table);
    return result as TSelect[];
  }

  /**
   * Finds first record matching the given condition.
   */
  async findFirst(where: SQL): Promise<TSelect | undefined> {
    const result = await this._db
      .select()
      .from(this._table)
      .where(where)
      .limit(1);
    return result[0] as TSelect | undefined;
  }

  /**
   * Creates a new record.
   */
  async create(data: TInsert): Promise<TSelect> {
    const result = await this._db
      .insert(this._table)
      .values(data as unknown as TTable['$inferInsert'])
      .returning();
    return result[0] as TSelect;
  }

  /**
   * Creates multiple records.
   */
  async createMany(data: TInsert[]): Promise<TSelect[]> {
    if (data.length === 0) return [];
    const result = await this._db
      .insert(this._table)
      .values(data as unknown as TTable['$inferInsert'][])
      .returning();
    return result as unknown as TSelect[];
  }

  /**
   * Updates a record by ID.
   */
  async update(id: string, data: Partial<TInsert>): Promise<TSelect | undefined> {
    const result = await this._db
      .update(this._table)
      .set(data as unknown as Partial<TTable['$inferInsert']>)
      .where(eq(this._idColumn, id))
      .returning();
    return result[0] as TSelect | undefined;
  }

  /**
   * Deletes a record by ID.
   */
  async delete(id: string): Promise<void> {
    await this._db.delete(this._table).where(eq(this._idColumn, id));
  }

  /**
   * Deletes all records matching the given condition.
   */
  async deleteMany(where: SQL): Promise<void> {
    await this._db.delete(this._table).where(where);
  }
}
