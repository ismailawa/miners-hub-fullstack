import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameFieldToUser1782060220499 implements MigrationInterface {
    name = 'AddNameFieldToUser1782060220499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

}
