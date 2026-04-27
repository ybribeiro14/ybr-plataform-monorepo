import { db } from "@ybr/database";
import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loginUser } from "../../../src/functions/auth/login-user";
import { cache } from "../../../src/infrastructure/cache/redis";

vi.mock("@ybr/database", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
  users: {},
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_refresh_token"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("../../../src/infrastructure/cache/redis", () => ({
  cache: {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  },
}));

const mockUser = {
  id: "usr_01j8n4test001",
  email: "alice@example.com",
  name: "Alice Test",
  role: "student" as const,
  passwordHash: "$2b$12$stored_hash",
};

const mockApp = {
  jwt: {
    sign: vi.fn().mockResolvedValue("mock_access_token"),
  },
} as unknown as FastifyInstance;

describe("loginUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns accessToken, refreshToken, and user on valid credentials", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);

    const result = await loginUser(
      { email: mockUser.email, password: "Password1" },
      mockApp,
    );

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe(mockUser.id);
    expect(result.user.email).toBe(mockUser.email);
    expect(result.user.name).toBe(mockUser.name);
    expect(result.user.role).toBe(mockUser.role);
  });

  it("throws 401 when user does not exist", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);

    await expect(
      loginUser(
        { email: "unknown@example.com", password: "Password1" },
        mockApp,
      ),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 when user has no passwordHash", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({
      ...mockUser,
      passwordHash: null,
    } as any);

    await expect(
      loginUser({ email: mockUser.email, password: "Password1" }, mockApp),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 when password is wrong", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(false as any);

    await expect(
      loginUser({ email: mockUser.email, password: "WrongPassword1" }, mockApp),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("saves the hashed refresh token in Redis with the correct key", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);

    await loginUser({ email: mockUser.email, password: "Password1" }, mockApp);

    expect(vi.mocked(cache.setex)).toHaveBeenCalledWith(
      `refresh:${mockUser.id}`,
      expect.any(Number),
      expect.any(String),
    );
  });

  it("refresh token contains the userId as prefix", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser as any);

    const result = await loginUser(
      { email: mockUser.email, password: "Password1" },
      mockApp,
    );

    expect(result.refreshToken).toMatch(new RegExp(`^${mockUser.id}:`));
  });
});
