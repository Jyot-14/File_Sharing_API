import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFilesTable1692092476074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE files (
        file_id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        user_id INT NOT NULL REFERENCES users(user_id),
        ispublic BOOLEAN NOT NULL DEFAULT false,
        file_extension VARCHAR(255) NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE files;');
  }
}
