import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { File } from './entities/File';
import { FileAccess } from './entities/FileAccess';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_host,
  port: Number(process.env.DB_port),
  username: process.env.DB_user,
  password: process.env.DB_password,
  database: process.env.DB_database,
  synchronize: false,
  logging: true,
  entities: [User, File, FileAccess],
  migrations: ['src/database/migrations/*.ts'],
});
