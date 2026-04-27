import { db } from "@ybr/database";
import type { FastifyInstance } from "fastify";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { cache } from "../../src/infrastructure/cache/redis";
import { buildTestApp } from "../helpers/build-test-app";

vi.mock("@ybr/database", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
  users: {},
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$12$mock_hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("../../src/infrastructure/cache/redis", () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue("OK"),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock("../../src/infrastructure/email/auth-emails", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const testUserId = "usr_01j8n4test001";

const mockDbUser = {
  id: testUserId,
  email: "alice@example.com",
  name: "Alice Test",
  role: "student" as const,
  passwordHash: "$2b$12$existing_hash",
  avatarUrl: null,
  createdAt: new Date("2024-01-01").toISOString(),
};

const setupInsertMock = (user = mockDbUser) => {
  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([user]),
    }),
  } as any);
};

const setupUpdateMock = () => {
  vi.mocked(db.update).mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  } as any);
};

describe("Auth Routes — Integration", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    app = await buildTestApp();
    authToken = await app.jwt.sign(
      { sub: testUserId, role: "student" },
      { expiresIn: "1h" },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── POST /auth/register ────────────────────────────────────────────────────

  describe("POST /auth/register", () => {
    it("returns 201 with the created user data", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
      setupInsertMock();

      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          name: "Alice Test",
          email: "alice@example.com",
          password: "Password1",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.email).toBe(mockDbUser.email);
      expect(body.data.id).toBe(testUserId);
    });

    it("returns 400 with EMAIL_ALREADY_EXISTS when email is taken", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue({
        id: "existing",
      } as any);

      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          name: "Alice Test",
          email: "alice@example.com",
          password: "Password1",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.status).toBe("error");
      expect(body.errors[0].code).toBe("EMAIL_ALREADY_EXISTS");
    });

    it("returns 400 when request body is invalid (malformed email)", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          name: "Alice Test",
          email: "not-an-email",
          password: "Password1",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 400 when password is too weak", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          name: "Alice Test",
          email: "alice@example.com",
          password: "weak",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ─── POST /auth/login ───────────────────────────────────────────────────────

  describe("POST /auth/login", () => {
    it("returns 200 with accessToken, refreshToken, and user on valid credentials", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockDbUser as any);
      vi.mocked(cache.setex).mockResolvedValue("OK" as any);

      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: mockDbUser.email, password: "Password1" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
      expect(body.data.user.id).toBe(testUserId);
    });

    it("returns 401 with invalid credentials", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);

      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "wrong@example.com", password: "Password1" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 401 when password does not match", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockDbUser as any);
      const bcrypt = await import("bcrypt");
      vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(false as any);

      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: mockDbUser.email, password: "WrongPassword1" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 400 when request body is invalid", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "not-an-email" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ─── POST /auth/refresh ─────────────────────────────────────────────────────

  describe("POST /auth/refresh", () => {
    it("returns 200 with a new accessToken when refresh token is valid", async () => {
      const refreshToken = `${testUserId}:valid_random_bytes`;
      vi.mocked(cache.get).mockResolvedValue("stored_bcrypt_hash");

      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.accessToken).toBeDefined();
    });

    it("returns 401 when refresh token format is invalid", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: "invalidtokenwithoutcolon" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 401 when refresh token is expired or not in Redis", async () => {
      vi.mocked(cache.get).mockResolvedValue(null);

      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: { refreshToken: `${testUserId}:some_bytes` },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ─── POST /auth/logout ──────────────────────────────────────────────────────

  describe("POST /auth/logout", () => {
    it("returns 200 when authenticated user logs out", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/logout",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
    });

    it("returns 401 when no JWT token is provided", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/logout",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  // ─── POST /auth/forgot-password ─────────────────────────────────────────────

  describe("POST /auth/forgot-password", () => {
    it("returns 200 with a generic message regardless of whether email exists", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);

      const response = await app.inject({
        method: "POST",
        url: "/auth/forgot-password",
        payload: { email: "anyone@example.com" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
    });

    it("returns 200 even when the email exists in the database", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockDbUser as any);
      vi.mocked(cache.setex).mockResolvedValue("OK" as any);

      const response = await app.inject({
        method: "POST",
        url: "/auth/forgot-password",
        payload: { email: mockDbUser.email },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  // ─── POST /auth/reset-password ──────────────────────────────────────────────

  describe("POST /auth/reset-password", () => {
    it("returns 200 when password is reset with a valid token", async () => {
      vi.mocked(cache.get).mockResolvedValue(testUserId);
      setupUpdateMock();

      const response = await app.inject({
        method: "POST",
        url: "/auth/reset-password",
        payload: { token: "abc123", password: "NewPassword1" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
    });

    it("returns 400 with INVALID_RESET_TOKEN when token is invalid", async () => {
      vi.mocked(cache.get).mockResolvedValue(null);

      const response = await app.inject({
        method: "POST",
        url: "/auth/reset-password",
        payload: { token: "invalid_token", password: "NewPassword1" },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.errors[0].code).toBe("INVALID_RESET_TOKEN");
    });
  });

  // ─── GET /auth/me ────────────────────────────────────────────────────────────

  describe("GET /auth/me", () => {
    it("returns 200 with the authenticated user profile", async () => {
      vi.mocked(db.query.users.findFirst).mockResolvedValue(mockDbUser as any);

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.id).toBe(testUserId);
      expect(body.data.email).toBe(mockDbUser.email);
    });

    it("returns 401 when no JWT token is provided", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
