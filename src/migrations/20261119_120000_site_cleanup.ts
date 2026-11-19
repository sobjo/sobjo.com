import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Notebook posts no longer link to a project (drop posts.project), projects no longer
 * have a role (drop projects.role), and two new desk drawings: MiniQ and the KVM board.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_project_id_projects_id_fk";
  ALTER TABLE "_posts_v" DROP CONSTRAINT IF EXISTS "_posts_v_version_project_id_projects_id_fk";
  DROP INDEX IF EXISTS "posts_project_idx";
  DROP INDEX IF EXISTS "_posts_v_version_version_project_idx";
  ALTER TABLE "posts" DROP COLUMN IF EXISTS "project_id";
  ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_project_id";
  ALTER TABLE "projects" DROP COLUMN IF EXISTS "role";
  ALTER TYPE "public"."enum_projects_illustration" ADD VALUE IF NOT EXISTS 'miniq' BEFORE 'idea';
  ALTER TYPE "public"."enum_projects_illustration" ADD VALUE IF NOT EXISTS 'kvm' BEFORE 'idea';`)
}

// Postgres can't drop enum values, so `down` leaves 'miniq' and 'kvm' in place.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "role" varchar;
  ALTER TABLE "posts" ADD COLUMN "project_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_project_id" integer;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_project_id_projects_id_fk" FOREIGN KEY ("version_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_project_idx" ON "posts" USING btree ("project_id");
  CREATE INDEX "_posts_v_version_version_project_idx" ON "_posts_v" USING btree ("version_project_id");`)
}
