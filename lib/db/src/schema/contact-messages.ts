import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

export const contactMessagesTable = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactMessageRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(4),
  message: z.string().min(20),
});

export type InsertContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
};
