import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshAccessToken } from "../../../src/functions/auth/refresh-token";
import { cache } from "../../../src/infrastructure/cache/redis";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_token"),
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

const mockApp = {
  jwt: {
    sign: vi.fn().mockResolvedValue("new_access_token"),
  },
} as unknown as FastifyInstance;

describe("refreshAccessToken", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a new accessToken when refresh token is valid", async () => {
    vi.mocked(cache.get).mockResolvedValue("stored_hash");

    const result = await refreshAccessToken(
      { refreshToken: `${testUserId}:valid_random_hex` },
      mockApp,
    );

    expect(result.accessToken).toBe("new_access_token");
  });

  it("throws 401 when token format is invalid (no colon separator)", async () => {
    await expect(
      refreshAccessToken({ refreshToken: "invalidtokenwithoutcolon" }, mockApp),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 when token is not found in Redis (expired or revoked)", async () => {
    vi.mocked(cache.get).mockResolvedValue(null);

    await expect(
      refreshAccessToken(
        { refreshToken: `${testUserId}:some_random_bytes` },
        mockApp,
      ),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 when the stored hash does not match the token", async () => {
    vi.mocked(cache.get).mockResolvedValue("stored_hash");
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(false as any);

    await expect(
      refreshAccessToken(
        { refreshToken: `${testUserId}:tampered_token` },
        mockApp,
      ),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
