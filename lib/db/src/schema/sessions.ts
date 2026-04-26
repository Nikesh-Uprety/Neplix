import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  impersonatorUserId: uuid("impersonator_user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  impersonatedStoreId: uuid("impersonated_store_id"),
  originalSessionToken: text("original_session_token"),
  impersonationExpiresAt: timestamp("impersonation_expires_at"),
  impersonationEndedAt: timestamp("impersonation_ended_at"),
  impersonationEndReason: text("impersonation_end_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type Session = typeof sessionsTable.$inferSelect;
