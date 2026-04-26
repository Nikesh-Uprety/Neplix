import { boolean, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type StorefrontSection = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  styles?: Record<string, string>;
};

export type StorefrontPageContent = {
  schemaVersion?: number;
  sections?: StorefrontSection[];
  seo?: Record<string, unknown>;
};

export const storefrontPagesTable = pgTable(
  "storefront_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    content: jsonb("content"),
    sections: jsonb("sections").$type<StorefrontSection[]>().notNull().default([]),
    templatePresetId: text("template_preset_id"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    storeSlugIdx: index("storefront_pages_store_slug_idx").on(table.storeId, table.slug),
  }),
);

export type StorefrontPage = typeof storefrontPagesTable.$inferSelect;
