import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const insertReturningMock = vi.fn();
const insertValuesMock = vi.fn(() => ({ returning: insertReturningMock }));
const insertMock = vi.fn(() => ({ values: insertValuesMock }));

const uploadMediaAssetMock = vi.fn();

vi.mock("@workspace/db", () => ({
  db: {
    insert: insertMock,
  },
  mediaAssetsTable: {},
  mediaBucketsTable: {},
}));

vi.mock("../middlewares/auth.js", () => ({
  authMiddleware: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../middlewares/tenant.js", () => ({
  resolveTenantContext: (req: { tenant?: { storeId: string } }, _res: unknown, next: () => void) => {
    req.tenant = { storeId: "store-test-1" };
    next();
  },
}));

vi.mock("../middlewares/admin.js", () => ({
  requireAdminPage: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("../lib/media-upload.js", () => ({
  uploadMediaAsset: uploadMediaAssetMock,
}));

async function createTestApp() {
  const mod = await import("./admin-media.js");
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use("/api/admin/media", mod.default);
  return app;
}

describe("admin media upload route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertReturningMock.mockResolvedValue([
      {
        id: "asset-1",
        storeId: "store-test-1",
        title: "hero.png",
        url: "https://cdn.test/hero.png",
        mimeType: "image/png",
      },
    ]);
  });

  it("uploads and persists media metadata", async () => {
    uploadMediaAssetMock.mockResolvedValue({
      provider: "tigris",
      url: "https://cdn.test/hero.png",
    });
    const app = await createTestApp();
    const res = await request(app).post("/api/admin/media/upload").send({
      fileName: "hero.png",
      contentType: "image/png",
      dataBase64: Buffer.from("fake-image").toString("base64"),
      isStorefront: true,
    });

    expect(res.status).toBe(201);
    expect(uploadMediaAssetMock).toHaveBeenCalledWith({
      storeId: "store-test-1",
      fileName: "hero.png",
      contentType: "image/png",
      dataBase64: Buffer.from("fake-image").toString("base64"),
    });
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: "store-test-1",
        title: "hero.png",
        url: "https://cdn.test/hero.png",
        mimeType: "image/png",
        isStorefront: true,
      }),
    );
    expect(res.body.url).toBe("https://cdn.test/hero.png");
    expect(res.body.asset.id).toBe("asset-1");
  });

  it("returns 400 for invalid upload payload", async () => {
    const app = await createTestApp();
    const res = await request(app).post("/api/admin/media/upload").send({
      fileName: "",
      contentType: "image/png",
      dataBase64: "",
    });

    expect(res.status).toBe(400);
    expect(uploadMediaAssetMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("returns 500 when upload provider throws", async () => {
    uploadMediaAssetMock.mockRejectedValue(new Error("provider unavailable"));
    const app = await createTestApp();
    const res = await request(app).post("/api/admin/media/upload").send({
      fileName: "hero.png",
      contentType: "image/png",
      dataBase64: Buffer.from("fake-image").toString("base64"),
    });

    expect(res.status).toBe(500);
    expect(insertMock).not.toHaveBeenCalled();
  });
});
