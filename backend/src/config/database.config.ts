import { registerAs } from '@nestjs/config';
import * as path from 'path';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    path.resolve(
      __dirname,
      '../modules/**/infrastructure/persistence/*.orm-entity{.ts,.js}',
    ),
  ],
  migrations: [path.resolve(__dirname, '../database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}));
