import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const mediaBucketsTable = pgTable(
  "media_buckets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeSlugIdx: index("media_buckets_store_slug_idx").on(table.storeId, table.slug),
  }),
);

export const mediaAssetsTable = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").notNull(),
    bucketId: uuid("bucket_id"),
    title: text("title"),
    url: text("url").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: text("size_bytes"),
    metadata: jsonb("metadata"),
    isStorefront: boolean("is_storefront").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeCreatedIdx: index("media_assets_store_created_idx").on(
      table.storeId,
      table.createdAt,
    ),
  }),
);

export type MediaBucket = typeof mediaBucketsTable.$inferSelect;
export type MediaAsset = typeof mediaAssetsTable.$inferSelect;
