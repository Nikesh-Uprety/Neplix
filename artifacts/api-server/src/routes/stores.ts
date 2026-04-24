import { Router, type IRouter, type Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, storefrontPagesTable, storesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/:slug", async (req, res: Response) => {
  const slug = String(req.params.slug ?? "").trim().toLowerCase();
  if (!slug) {
    res.status(400).json({ error: "Store slug is required" });
    return;
  }

  const [store] = await db
    .select({
      id: storesTable.id,
      slug: storesTable.slug,
      name: storesTable.name,
      legalName: storesTable.legalName,
      planCode: storesTable.planCode,
      status: storesTable.status,
      settings: storesTable.settings,
    })
    .from(storesTable)
    .where(and(eq(storesTable.slug, slug), eq(storesTable.status, "active")))
    .limit(1);

  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }

  const pages = await db
    .select({
      id: storefrontPagesTable.id,
      slug: storefrontPagesTable.slug,
      title: storefrontPagesTable.title,
      content: storefrontPagesTable.content,
      isPublished: storefrontPagesTable.isPublished,
      updatedAt: storefrontPagesTable.updatedAt,
    })
    .from(storefrontPagesTable)
    .where(
      and(
        eq(storefrontPagesTable.storeId, store.id),
        eq(storefrontPagesTable.isPublished, true),
      ),
    )
    .orderBy(asc(storefrontPagesTable.slug));

  res.json({ store, pages });
});

export default router;
