import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { plansTable } from "./plans";

export type StoreStatus = "active" | "suspended" | "archived";

export type StoreSettings = {
  timezone?: string;
  currency?: string;
  locale?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export const storesTable = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  legalName: text("legal_name"),
  status: text("status").$type<StoreStatus>().notNull().default("active"),
  planCode: text("plan_code").notNull().default("free"),
  settings: jsonb("settings").$type<StoreSettings>().notNull().default({}),
  isVerified: boolean("is_verified").notNull().default(false),
  launchedAt: timestamp("launched_at"),
  createdByUserId: uuid("created_by_user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const storeDomainsTable = pgTable("store_domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  hostname: text("hostname").notNull().unique(),
  isPrimary: boolean("is_primary").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StoreRole =
  | "owner"
  | "admin"
  | "manager"
  | "staff"
  | "viewer"
  | "cashier";

export const storeMembershipsTable = pgTable("store_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: text("role").$type<StoreRole>().notNull().default("staff"),
  status: text("status").notNull().default("active"),
  invitedByUserId: uuid("invited_by_user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BillingCycle = "monthly" | "yearly";
export type TenantSubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export const storeSubscriptionsTable = pgTable("store_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .unique()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plansTable.id),
  status: text("status")
    .$type<TenantSubscriptionStatus>()
    .notNull()
    .default("trialing"),
  billingCycle: text("billing_cycle")
    .$type<BillingCycle>()
    .notNull()
    .default("yearly"),
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const storeUsageCountersTable = pgTable("store_usage_counters", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  metric: text("metric").notNull(),
  value: integer("value").notNull().default(0),
  metadata: jsonb("metadata"),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Store = typeof storesTable.$inferSelect;
export type InsertStore = typeof storesTable.$inferInsert;
export type StoreDomain = typeof storeDomainsTable.$inferSelect;
export type StoreMembership = typeof storeMembershipsTable.$inferSelect;
export type StoreSubscription = typeof storeSubscriptionsTable.$inferSelect;
