import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const storefrontPagesTable = pgTable(
  "storefront_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    content: jsonb("content"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeSlugIdx: index("storefront_pages_store_slug_idx").on(table.storeId, table.slug),
  }),
);

export type StorefrontPage = typeof storefrontPagesTable.$inferSelect;
