import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Bench hardware parts get a "Comms" group (BLE, Wi-Fi, CAN-FD). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_tools_part_group" ADD VALUE IF NOT EXISTS 'comms' BEFORE 'materials';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "tools" SET "part_group" = NULL WHERE "part_group" = 'comms';
  ALTER TABLE "tools" ALTER COLUMN "part_group" SET DATA TYPE text;
  DROP TYPE "public"."enum_tools_part_group";
  CREATE TYPE "public"."enum_tools_part_group" AS ENUM('microcontrollers', 'sensors', 'motors', 'materials');
  ALTER TABLE "tools" ALTER COLUMN "part_group" SET DATA TYPE "public"."enum_tools_part_group" USING "part_group"::"public"."enum_tools_part_group";`)
}
