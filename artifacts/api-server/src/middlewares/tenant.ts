import { and, eq } from "drizzle-orm";
import { Response, NextFunction } from "express";
import { db, storeDomainsTable, storeMembershipsTable, storesTable } from "@workspace/db";
import type { AuthRequest } from "./auth.js";

export interface TenantRequest extends AuthRequest {
  tenant?: {
    storeId: string;
    storeSlug: string;
    role: string;
  };
}

function normalizeHost(rawHost: string | undefined): string | null {
  if (!rawHost) return null;
  return rawHost.split(":")[0]?.toLowerCase() ?? null;
}

export function activeStoreId(req: AuthRequest): string | null {
  return req.user?.activeStoreId ?? req.user?.storeId ?? null;
}

export async function resolveTenantContext(
  req: TenantRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const host = normalizeHost(req.headers.host);
    let storeId = activeStoreId(req);

    if (host) {
      const [domain] = await db
        .select({ storeId: storeDomainsTable.storeId })
        .from(storeDomainsTable)
        .where(eq(storeDomainsTable.hostname, host))
        .limit(1);
      if (domain?.storeId) {
        storeId = domain.storeId;
      }
    }

    if (!storeId) {
      res.status(403).json({ error: "No active store selected" });
      return;
    }

    const [membership] = await db
      .select({
        storeId: storeMembershipsTable.storeId,
        role: storeMembershipsTable.role,
        storeSlug: storesTable.slug,
      })
      .from(storeMembershipsTable)
      .innerJoin(storesTable, eq(storeMembershipsTable.storeId, storesTable.id))
      .where(
        and(
          eq(storeMembershipsTable.storeId, storeId),
          eq(storeMembershipsTable.userId, req.user.id),
          eq(storeMembershipsTable.status, "active"),
        ),
      )
      .limit(1);

    if (!membership) {
      res.status(403).json({ error: "Store membership required" });
      return;
    }

    req.tenant = {
      storeId: membership.storeId,
      storeSlug: membership.storeSlug,
      role: membership.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}
