import { afterEach, describe, expect, it, vi } from "vitest";
import { logoutUser } from "../../../src/functions/auth/logout-user";
import { cache } from "../../../src/infrastructure/cache/redis";

vi.mock("../../../src/infrastructure/cache/redis", () => ({
  cache: {
    get: vi.fn(),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  },
}));

describe("logoutUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("removes the refresh token from Redis using the correct key", async () => {
    const userId = "usr_01j8n4test001";
    await logoutUser({ userId });

    expect(vi.mocked(cache.del)).toHaveBeenCalledWith(`refresh:${userId}`);
  });

  it("returns success: true", async () => {
    const result = await logoutUser({ userId: "usr_01j8n4test001" });

    expect(result.success).toBe(true);
  });
});
