import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserUuid1700000000000 implements MigrationInterface {
	name = 'InitUserUuid1700000000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

		await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'User'
              AND column_name = 'id'
              AND data_type = 'uuid'
          ) THEN
            ALTER TABLE "User" ADD COLUMN "id_uuid" uuid DEFAULT gen_random_uuid();
            UPDATE "User" SET "id_uuid" = gen_random_uuid() WHERE "id_uuid" IS NULL;
            ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_pkey";
            ALTER TABLE "User" DROP COLUMN "id";
            ALTER TABLE "User" RENAME COLUMN "id_uuid" TO "id";
            ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
            ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
          END IF;
          ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "refreshTokenHash" character varying;
          ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roles" text[] NOT NULL DEFAULT ARRAY['USER']::text[];
          ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetTokenHash" character varying;
          ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetTokenExpiresAt" TIMESTAMPTZ;
          ALTER TABLE "User" ALTER COLUMN "name" TYPE character varying(191);
          ALTER TABLE "User" ALTER COLUMN "email" TYPE character varying(191);
          CREATE UNIQUE INDEX IF NOT EXISTS "UQ_User_email" ON "User" ("email");
        ELSE
          CREATE TABLE "User" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "name" character varying(191) NOT NULL,
            "email" character varying(191) NOT NULL,
            "roles" text[] NOT NULL DEFAULT ARRAY['USER']::text[],
            "hashedPassword" character varying,
            "refreshTokenHash" character varying,
            "passwordResetTokenHash" character varying,
            "passwordResetTokenExpiresAt" TIMESTAMPTZ,
            CONSTRAINT "UQ_User_email" UNIQUE ("email"),
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
          );
        END IF;
      END
      $$;
    `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "User"`);
	}
}
