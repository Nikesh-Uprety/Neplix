import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verificationLimitMock = vi.fn();
const verificationOrderByMock = vi.fn(() => ({ limit: verificationLimitMock }));
const verificationWhereMock = vi.fn(() => ({ orderBy: verificationOrderByMock, limit: verificationLimitMock }));
const verificationFromMock = vi.fn(() => ({ where: verificationWhereMock, orderBy: verificationOrderByMock, limit: verificationLimitMock }));

const userLimitMock = vi.fn();
const userWhereMock = vi.fn(() => ({ limit: userLimitMock }));
const userFromMock = vi.fn(() => ({ where: userWhereMock, limit: userLimitMock }));

const selectMock = vi.fn(() => ({
  from: (table: unknown) => {
    if (table === "email-verification-codes-table") return verificationFromMock();
    return userFromMock();
  },
}));

const updateWhereMock = vi.fn();
const updateSetMock = vi.fn(() => ({ where: updateWhereMock }));
const updateMock = vi.fn(() => ({ set: updateSetMock }));

const insertValuesMock = vi.fn(() => ({ returning: vi.fn() }));
const insertMock = vi.fn(() => ({ values: insertValuesMock }));

const deleteWhereMock = vi.fn();
const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));

const sendVerificationCodeEmailMock = vi.fn();

vi.mock("@workspace/db", () => ({
  db: {
    select: selectMock,
    update: updateMock,
    insert: insertMock,
    delete: deleteMock,
  },
  emailVerificationCodesTable: "email-verification-codes-table",
  usersTable: "users-table",
  sessionsTable: "sessions-table",
  storesTable: "stores-table",
  storeSettingsTable: "store-settings-table",
  storeMembershipsTable: "store-memberships-table",
  storefrontPagesTable: "storefront-pages-table",
  productsTable: "products-table",
  productImagesTable: "product-images-table",
  impersonationAuditLogsTable: "impersonation-audit-logs-table",
  registerSchema: {
    safeParse: (value: unknown) => ({ success: true, data: value }),
  },
  loginSchema: {
    safeParse: (value: unknown) => ({ success: true, data: value }),
  },
  getAdminAllowedPages: () => [],
  canAccessAdminPanel: () => true,
}));

vi.mock("drizzle-orm", () => ({
  eq: (left: unknown, right: unknown) => ({ type: "eq", left, right }),
  and: (...parts: unknown[]) => ({ type: "and", parts }),
  desc: (value: unknown) => ({ type: "desc", value }),
  isNull: (value: unknown) => ({ type: "isNull", value }),
}));

vi.mock("../middlewares/auth.js", () => ({
  authMiddleware: (req: { user?: unknown; session?: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: "user-1", storeId: "store-1", activeStoreId: "store-1", role: "owner" };
    req.session = null;
    next();
  },
}));

vi.mock("./subscriptions.js", () => ({
  createTrialSubscription: vi.fn(),
}));

vi.mock("../lib/tenant.js", () => ({
  provisionStoreForUser: vi.fn(),
}));

vi.mock("../lib/email.js", () => ({
  sendVerificationCodeEmail: sendVerificationCodeEmailMock,
}));

vi.mock("../lib/logger.js", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

async function createApp() {
  const mod = await import("./auth.js");
  const app = express();
  app.use(express.json());
  app.use("/api/auth", mod.default);
  return app;
}

describe("auth registration security hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces resend cooldown for OTP", async () => {
    verificationLimitMock.mockResolvedValueOnce([
      {
        id: "verify-1",
        email: "new@example.com",
        firstName: "New",
        lastName: "User",
        passwordHash: "hash",
        lastSentAt: new Date(),
        attempts: 0,
      },
    ]);

    const app = await createApp();
    const res = await request(app).post("/api/auth/register/resend").send({
      email: "new@example.com",
    });

    expect(res.status).toBe(429);
    expect(res.body.error).toContain("Please wait");
    expect(sendVerificationCodeEmailMock).not.toHaveBeenCalled();
  });

  it("locks verification request after repeated invalid OTP attempts", async () => {
    verificationLimitMock.mockResolvedValueOnce([
      {
        id: "verify-2",
        email: "new@example.com",
        codeHash: "not-a-real-hash",
        firstName: "New",
        lastName: "User",
        passwordHash: "hash",
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 4,
        lockedUntil: null,
      },
    ]);

    const app = await createApp();
    const res = await request(app).post("/api/auth/register/verify").send({
      email: "new@example.com",
      code: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid verification code");
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attempts: 5,
        lockedUntil: expect.any(Date),
      }),
    );
  });

  it("returns 429 when OTP request is currently locked", async () => {
    verificationLimitMock.mockResolvedValueOnce([
      {
        id: "verify-3",
        email: "new@example.com",
        codeHash: "not-a-real-hash",
        firstName: "New",
        lastName: "User",
        passwordHash: "hash",
        expiresAt: new Date(Date.now() + 60_000),
        attempts: 5,
        lockedUntil: new Date(Date.now() + 5 * 60_000),
      },
    ]);

    const app = await createApp();
    const res = await request(app).post("/api/auth/register/verify").send({
      email: "new@example.com",
      code: "123456",
    });

    expect(res.status).toBe(429);
    expect(res.body.error).toContain("Too many invalid attempts");
    expect(typeof res.body.retryAfterSeconds).toBe("number");
    expect(updateMock).not.toHaveBeenCalled();
  });
});

