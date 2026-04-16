import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod";

export const demoBookingsTable = pgTable("demo_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  businessType: text("business_type").notNull(),
  timeSlot: text("time_slot").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const demoBookingRequestSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  businessType: z.string().min(1),
  timeSlot: z.string().min(1),
  message: z.string().optional(),
});

export type InsertDemoBooking = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessType: string;
  timeSlot: string;
  message?: string | null;
};

export type DemoBooking = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessType: string;
  timeSlot: string;
  message: string | null;
  status: string;
  createdAt: Date;
};
