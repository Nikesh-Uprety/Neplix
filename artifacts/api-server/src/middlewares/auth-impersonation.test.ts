import { describe, expect, it, vi, beforeEach } from "vitest";

const sessionLimitMock = vi.fn();
const sessionWhereMock = vi.fn(() => ({ limit: sessionLimitMock }));
const sessionFromMock = vi.fn(() => ({ where: sessionWhereMock }));
const userLimitMock = vi.fn();
const userWhereMock = vi.fn(() => ({ limit: userLimitMock }));
const userFromMock = vi.fn(() => ({ where: userWhereMock }));
const selectMock = vi.fn(() => ({
  from: (table: unknown) => {
    if (table === "sessions-table") return sessionFromMock();
    return userFromMock();
  },
}));

const insertValuesMock = vi.fn();
const insertMock = vi.fn(() => ({ values: insertValuesMock }));
const updateWhereMock = vi.fn();
const updateSetMock = vi.fn(() => ({ where: updateWhereMock }));
const updateMock = vi.fn(() => ({ set: updateSetMock }));
const deleteWhereMock = vi.fn();
const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));

vi.mock("@workspace/db", () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  },
  sessionsTable: "sessions-table",
  usersTable: "users-table",
  impersonationAuditLogsTable: "impersonation-audit-logs-table",
}));

describe("auth middleware impersonation expiry handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs timeout and clears expired impersonation sessions", async () => {
    sessionLimitMock.mockResolvedValue([
      {
        id: "session-1",
        userId: "target-1",
        token: "expired-token",
        expiresAt: new Date(Date.now() - 1_000),
        impersonatorUserId: "super-1",
        impersonatedStoreId: "store-1",
        impersonationExpiresAt: new Date(Date.now() - 1_000),
        impersonationEndedAt: null,
      },
    ]);
    userLimitMock.mockResolvedValue([]);

    const { authMiddleware } = await import("./auth.js");
    const req = {
      cookies: { session_token: "expired-token" },
      headers: {},
    } as any;
    const clearCookie = vi.fn();
    const status = vi.fn(() => ({ json: vi.fn() }));
    const res = { clearCookie, status } as any;
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(clearCookie).toHaveBeenCalledWith("session_token", expect.any(Object));
    expect(clearCookie).toHaveBeenCalledWith(
      "impersonator_session_token",
      expect.any(Object),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
