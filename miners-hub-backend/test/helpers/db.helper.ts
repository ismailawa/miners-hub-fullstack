/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { User } from '../../src/entities/user.entity';
import { Listing } from '../../src/entities/listing.entity';
import { Auction } from '../../src/entities/auction.entity';

/**
 * Database Helper
 *
 * Utilities for database operations in tests
 */

/**
 * Get repository for an entity
 *
 * @param dataSource - TypeORM DataSource
 * @param entity - Entity class
 * @returns Repository instance
 */
export function getRepository<T>(
  dataSource: DataSource,
  entity: EntityTarget<T>,
): Repository<T> {
  return dataSource.getRepository(entity);
}

/**
 * Clean up test data from database
 *
 * @param dataSource - TypeORM DataSource
 * @param entities - Array of entity classes to clean
 */
export async function cleanupTestData(
  dataSource: DataSource,
  entities: EntityTarget<any>[],
): Promise<void> {
  // Delete in reverse order to respect foreign key constraints
  const reversedEntities = [...entities].reverse();

  for (const entity of reversedEntities) {
    const repository = getRepository(dataSource, entity);
    await repository.delete({});
  }
}

/**
 * Clean up all test data (common entities)
 *
 * @param dataSource - TypeORM DataSource
 */
export async function cleanupAllTestData(
  dataSource: DataSource,
): Promise<void> {
  // Order matters: delete child entities first
  await cleanupTestData(dataSource, [
    Auction,
    Listing,
    User,
    // Add other entities as needed
  ]);
}

/**
 * Save test entity to database
 *
 * @param dataSource - TypeORM DataSource
 * @param entity - Entity class
 * @param data - Entity data
 * @returns Saved entity
 */
export async function saveTestEntity<T>(
  dataSource: DataSource,
  entity: EntityTarget<T>,
  data: Partial<T>,
): Promise<T> {
  const repository = getRepository(dataSource, entity);
  const entityInstance = repository.create(data as any);
  return await repository.save(entityInstance);
}

/**
 * Find test entity by ID
 *
 * @param dataSource - TypeORM DataSource
 * @param entity - Entity class
 * @param id - Entity ID
 * @returns Entity or null
 */
export async function findTestEntityById<T>(
  dataSource: DataSource,
  entity: EntityTarget<T>,
  id: string,
): Promise<T | null> {
  const repository = getRepository(dataSource, entity);
  return await repository.findOne({ where: { id } as any });
}

/**
 * Find all test entities
 *
 * @param dataSource - TypeORM DataSource
 * @param entity - Entity class
 * @returns Array of entities
 */
export async function findAllTestEntities<T>(
  dataSource: DataSource,
  entity: EntityTarget<T>,
): Promise<T[]> {
  const repository = getRepository(dataSource, entity);
  return await repository.find();
}

/**
 * Delete test entity by ID
 *
 * @param dataSource - TypeORM DataSource
 * @param entity - Entity class
 * @param id - Entity ID
 * @returns True if deleted, false if not found
 */
export async function deleteTestEntityById<T>(
  dataSource: DataSource,
  entity: EntityTarget<T>,
  id: string,
): Promise<boolean> {
  const repository = getRepository(dataSource, entity);
  const result = await repository.delete({ id } as any);
  return (result.affected ?? 0) > 0;
}

/**
 * Count test entities
 *
 * @param dataSource - TypeORM DataSource
 * @param entity - Entity class
 * @returns Count of entities
 */
export async function countTestEntities<T>(
  dataSource: DataSource,
  entity: EntityTarget<T>,
): Promise<number> {
  const repository = getRepository(dataSource, entity);
  return await repository.count();
}

/**
 * Execute raw SQL query (use with caution)
 *
 * @param dataSource - TypeORM DataSource
 * @param query - SQL query string
 * @param parameters - Query parameters
 * @returns Query result
 */
export async function executeRawQuery(
  dataSource: DataSource,
  query: string,
  parameters?: any[],
): Promise<any> {
  return await dataSource.query(query, parameters);
}

/**
 * Truncate table (faster than delete, but resets auto-increment)
 *
 * @param dataSource - TypeORM DataSource
 * @param tableName - Table name
 */
export async function truncateTable(
  dataSource: DataSource,
  tableName: string,
): Promise<void> {
  await dataSource.query(
    `TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`,
  );
}

/**
 * Begin transaction
 *
 * @param dataSource - TypeORM DataSource
 * @returns Query runner with transaction
 */
export async function beginTransaction(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  return queryRunner;
}

/**
 * Rollback transaction
 *
 * @param queryRunner - Query runner with active transaction
 */
export async function rollbackTransaction(queryRunner: any): Promise<void> {
  await queryRunner.rollbackTransaction();
  await queryRunner.release();
}

/**
 * Commit transaction
 *
 * @param queryRunner - Query runner with active transaction
 */
export async function commitTransaction(queryRunner: any): Promise<void> {
  await queryRunner.commitTransaction();
  await queryRunner.release();
}
