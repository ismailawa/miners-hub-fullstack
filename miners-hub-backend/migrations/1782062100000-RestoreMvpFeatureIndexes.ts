import { MigrationInterface, QueryRunner } from "typeorm";

export class RestoreMvpFeatureIndexes1782062100000 implements MigrationInterface {
    name = 'RestoreMvpFeatureIndexes1782062100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_documents_review_status" ON "documents" ("review_status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_status" ON "events" ("status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_date" ON "events" ("date")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_featured" ON "events" ("featured")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_posts_category" ON "forum_posts" ("category")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_posts_created_at" ON "forum_posts" ("created_at")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_replies_post_id" ON "forum_replies" ("post_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_forum_replies_created_at" ON "forum_replies" ("created_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_replies_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_replies_post_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_posts_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_forum_posts_category"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_events_featured"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_events_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_events_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_documents_review_status"`);
    }
}
