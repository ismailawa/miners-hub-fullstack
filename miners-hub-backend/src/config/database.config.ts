import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Database configuration for TypeORM
 * Connects to Supabase PostgreSQL database
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Parse connection string
  // Format: postgresql://user:password@host:port/database
  const url = new URL(databaseUrl);

  return {
    type: 'postgres',
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
    ssl:
      configService.get<string>('NODE_ENV') === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    migrationsRun: false,
    // Connection pool settings
    extra: {
      max: 10, // Maximum number of connections in the pool
      min: 2, // Minimum number of connections in the pool
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 10000, // Connection timeout in milliseconds
    },
    retryAttempts: 3, // Retry connection attempts
    retryDelay: 3000, // Delay between retries (3 seconds)
  };
};
