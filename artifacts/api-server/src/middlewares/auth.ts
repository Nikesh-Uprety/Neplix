import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: typeof usersTable.$inferSelect;
  sessionToken?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.session_token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.token, token),
          gt(sessionsTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      res.status(401).json({ error: "Session expired or invalid" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = user;
    req.sessionToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.session_token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  authMiddleware(req, res, next);
}
