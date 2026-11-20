import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Projects no longer show build progress: drop the progress done/total columns. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN IF EXISTS "progress_done";
  ALTER TABLE "projects" DROP COLUMN IF EXISTS "progress_total";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "progress_done" numeric DEFAULT 0;
  ALTER TABLE "projects" ADD COLUMN "progress_total" numeric DEFAULT 8;`)
}
