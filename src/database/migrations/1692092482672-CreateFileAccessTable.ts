import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileAccessTable1692092482672 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE file_access (
        access_id serial PRIMARY KEY,
        file_id INT REFERENCES files(file_id),
        user_id INT REFERENCES users(user_id),
        UNIQUE(file_id, user_id) 
      );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE file_access;');
  }
}
