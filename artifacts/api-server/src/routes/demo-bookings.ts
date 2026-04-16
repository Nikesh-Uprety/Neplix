import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { demoBookingsTable, demoBookingRequestSchema } from "@workspace/db";
import { desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/", async (req: Request, res: Response) => {
  const parsed = demoBookingRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  try {
    const [booking] = await db
      .insert(demoBookingsTable)
      .values({
        ...parsed.data,
        message: parsed.data.message ?? null,
        status: "pending",
      })
      .returning();

    res.status(201).json({ booking });
  } catch (err) {
    throw err;
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const bookings = await db
    .select()
    .from(demoBookingsTable)
    .orderBy(desc(demoBookingsTable.createdAt));

  res.json({ bookings });
});

export default router;
