import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFilesTable1692163946917 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE files
      ADD COLUMN file_extension VARCHAR; 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE files
      DROP COLUMN IF EXISTS file_extension;
    `);
  }
}
