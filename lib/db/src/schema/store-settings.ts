import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { storesTable } from "./stores";

export type StoreMenuLink = {
  label: string;
  url: string;
};

export type StoreSocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  x?: string;
  youtube?: string;
  [key: string]: string | undefined;
};

export const storeSettingsTable = pgTable("store_settings", {
  storeId: uuid("store_id")
    .primaryKey()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").notNull().default("#111827"),
  fontFamily: text("font_family").notNull().default("Inter"),
  navbarMenu: jsonb("navbar_menu").$type<StoreMenuLink[]>().notNull().default([]),
  footerLinks: jsonb("footer_links").$type<StoreMenuLink[]>().notNull().default([]),
  socialLinks: jsonb("social_links").$type<StoreSocialLinks>().notNull().default({}),
  landingTemplateId: text("landing_template_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StoreSettingsRow = typeof storeSettingsTable.$inferSelect;
export type InsertStoreSettingsRow = typeof storeSettingsTable.$inferInsert;
