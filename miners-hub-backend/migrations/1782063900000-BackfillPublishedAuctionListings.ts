import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillPublishedAuctionListings1782063900000
  implements MigrationInterface
{
  name = 'BackfillPublishedAuctionListings1782063900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "auctions" (
        "id",
        "listing_id",
        "start_time",
        "end_time",
        "starting_bid",
        "minimum_increment",
        "current_bid",
        "status",
        "created_at",
        "updated_at"
      )
      SELECT
        uuid_generate_v4(),
        listing."id",
        now(),
        now() + interval '7 days',
        listing."price",
        0,
        NULL,
        'active',
        now(),
        now()
      FROM "listings" listing
      LEFT JOIN "auctions" auction ON auction."listing_id" = listing."id"
      WHERE listing."status" = 'published'
        AND listing."listing_type" = 'auction'
        AND auction."id" IS NULL
    `);
  }

  public async down(): Promise<void> {
    // Data backfill only. Existing auction rows are preserved on rollback.
  }
}
