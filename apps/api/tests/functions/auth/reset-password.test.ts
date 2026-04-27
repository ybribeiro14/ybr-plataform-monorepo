import { db } from "@ybr/database";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetPassword } from "../../../src/functions/auth/reset-password";
import { cache } from "../../../src/infrastructure/cache/redis";

vi.mock("@ybr/database", () => ({
  db: {
    update: vi.fn(),
  },
  users: {},
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("new_hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("../../../src/infrastructure/cache/redis", () => ({
  cache: {
    get: vi.fn(),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  },
}));

const testUserId = "usr_01j8n4test001";
const validToken = "abc123";
const newPassword = "NewPassword1";

const setupUpdateMock = () => {
  vi.mocked(db.update).mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  } as any);
};

describe("resetPassword", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates the password and returns a success message", async () => {
    vi.mocked(cache.get).mockResolvedValue(testUserId);
    setupUpdateMock();

    const result = await resetPassword({
      token: validToken,
      password: newPassword,
    });

    expect(result.message).toBe("Password updated successfully");
  });

  it("deletes the reset token from Redis after password update", async () => {
    vi.mocked(cache.get).mockResolvedValue(testUserId);
    setupUpdateMock();

    await resetPassword({ token: validToken, password: newPassword });

    expect(vi.mocked(cache.del)).toHaveBeenCalledWith(
      `pwd_reset:${validToken}`,
    );
  });

  it("deletes the refresh token from Redis to invalidate any active session", async () => {
    vi.mocked(cache.get).mockResolvedValue(testUserId);
    setupUpdateMock();

    await resetPassword({ token: validToken, password: newPassword });

    expect(vi.mocked(cache.del)).toHaveBeenCalledWith(`refresh:${testUserId}`);
  });

  it("throws with code INVALID_RESET_TOKEN when token does not exist in Redis", async () => {
    vi.mocked(cache.get).mockResolvedValue(null);

    await expect(
      resetPassword({ token: "expired_token", password: newPassword }),
    ).rejects.toMatchObject({ code: "INVALID_RESET_TOKEN" });
  });
});
