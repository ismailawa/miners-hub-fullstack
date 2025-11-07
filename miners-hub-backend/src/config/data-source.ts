import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

const configService = new ConfigService();

/**
 * TypeORM DataSource configuration for migrations
 * This is used by TypeORM CLI for running migrations
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: new URL(configService.get<string>('DATABASE_URL') || '').hostname,
  port: parseInt(
    new URL(configService.get<string>('DATABASE_URL') || '').port || '5432',
    10,
  ),
  username: new URL(configService.get<string>('DATABASE_URL') || '').username,
  password: new URL(configService.get<string>('DATABASE_URL') || '').password,
  database: new URL(
    configService.get<string>('DATABASE_URL') || '',
  ).pathname.slice(1),
  ssl:
    configService.get<string>('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false,
  logging: configService.get<string>('NODE_ENV') === 'development',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../../migrations/*{.ts,.js}')],
  migrationsRun: false,
});
