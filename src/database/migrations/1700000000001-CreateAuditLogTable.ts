import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogTable1700000000001 implements MigrationInterface {
	name = 'CreateAuditLogTable1700000000001';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
		await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "method" character varying(20) NOT NULL,
        "path" character varying(2048) NOT NULL,
        "statusCode" integer NOT NULL,
        "durationMs" integer NOT NULL,
        "requestId" character varying(100),
        "userId" character varying(128),
        "ipAddress" character varying(128),
        "userAgent" character varying(512),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);
		await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_AuditLog_createdAt" ON "AuditLog" ("createdAt");
    `);
		await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_AuditLog_userId" ON "AuditLog" ("userId");
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "AuditLog"`);
	}
}
