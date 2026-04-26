import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { impersonationAuditLogsTable, sessionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: typeof usersTable.$inferSelect;
  session?: typeof sessionsTable.$inferSelect;
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
      .where(eq(sessionsTable.token, token))
      .limit(1);

    if (!session) {
      res.status(401).json({ error: "Session expired or invalid" });
      return;
    }

    const now = new Date();
    if (session.expiresAt <= now) {
      if (
        session.impersonatorUserId &&
        session.impersonatedStoreId &&
        session.impersonationExpiresAt &&
        !session.impersonationEndedAt
      ) {
        await db.insert(impersonationAuditLogsTable).values({
          sessionId: session.id,
          actorUserId: session.impersonatorUserId,
          targetUserId: session.userId,
          storeId: session.impersonatedStoreId,
          eventType: "impersonation_expired",
          metadata: {
            expiredAt: now.toISOString(),
            reason: "timeout",
          },
        });
        await db
          .update(sessionsTable)
          .set({
            impersonationEndedAt: now,
            impersonationEndReason: "timeout",
          })
          .where(eq(sessionsTable.id, session.id));
      }
      await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
      res.clearCookie("session_token", { path: "/", secure: true, sameSite: "none" });
      res.clearCookie("impersonator_session_token", { path: "/", secure: true, sameSite: "none" });
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
    req.session = session;
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
