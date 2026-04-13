import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDroneVersionColumn1775987184610 implements MigrationInterface {
    name = 'AddDroneVersionColumn1775987184610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drones" ADD "version" integer NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drones" DROP COLUMN "version"`);
    }

}
