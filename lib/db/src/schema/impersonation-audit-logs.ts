import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessionsTable } from "./sessions";
import { storesTable } from "./stores";
import { usersTable } from "./users";

export type ImpersonationAuditEvent =
  | "impersonation_started"
  | "impersonation_ended"
  | "impersonation_expired";

export const impersonationAuditLogsTable = pgTable("impersonation_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessionsTable.id, { onDelete: "cascade" }),
  actorUserId: uuid("actor_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  targetUserId: uuid("target_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  storeId: uuid("store_id")
    .notNull()
    .references(() => storesTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").$type<ImpersonationAuditEvent>().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
