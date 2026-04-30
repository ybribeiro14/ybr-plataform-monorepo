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
import { buildTestApp } from "../helpers/build-test-app";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@ybr/database", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
  users: {},
  courses: {},
  enrollments: {},
  inviteTokens: {},
  creators: {},
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$12$mock_hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Proxy-based chainable mock for Drizzle's select() builder.
 */
const mockSelectChain = (rows: unknown[]) => {
  const promise = Promise.resolve(rows);
  const chain: Record<string, unknown> = new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (prop === "then") return promise.then.bind(promise);
        if (prop === "catch") return promise.catch.bind(promise);
        if (prop === "finally") return promise.finally.bind(promise);
        return () => chain;
      },
    },
  );
  vi.mocked(db.select).mockReturnValueOnce(
    chain as ReturnType<typeof db.select>,
  );
  return chain;
};

const mockInsert = (rows: unknown[]) => {
  vi.mocked(db.insert).mockReturnValueOnce({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(rows),
    }),
  } as ReturnType<typeof db.insert>);
};

// ─── Test data ──────────────────────────────────────────────────────────────

const VALID_TOKEN = "invite_token_abc123";
const TEST_COURSE_ID = "crs_01j8n4wbk0000001";
const TEST_USER_ID = "usr_01j8n4wbk0000001";
const TEST_ENROLLMENT_ID = "enr_01j8n4wbk0000001";
const TEST_CREATOR_NAME = "Chef Maria";

const mockActiveInvite = {
  id: "inv_01test001",
  courseId: TEST_COURSE_ID,
  courseTitle: "Artisan Bread Baking",
  creatorName: TEST_CREATOR_NAME,
  expiresAt: null,
  isActive: true,
  token: VALID_TOKEN,
};

const mockNewUser = {
  id: TEST_USER_ID,
};

const mockEnrollment = {
  id: TEST_ENROLLMENT_ID,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Invite Enrollment Flow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── GET /invite/:token ────────────────────────────────────────────────

  describe("GET /invite/:token — validate token", () => {
    it("returns 200 with course info for a valid active token", async () => {
      mockSelectChain([mockActiveInvite]);

      const response = await app.inject({
        method: "GET",
        url: `/invite/${VALID_TOKEN}`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.token).toBe(VALID_TOKEN);
      expect(body.data.courseId).toBe(TEST_COURSE_ID);
      expect(body.data.courseTitle).toBe("Artisan Bread Baking");
      expect(body.data.creatorName).toBe(TEST_CREATOR_NAME);
    });

    it("returns 404 when token does not exist", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "GET",
        url: "/invite/nonexistent_token",
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 410 when invite link is revoked (isActive false)", async () => {
      mockSelectChain([{ ...mockActiveInvite, isActive: false }]);

      const response = await app.inject({
        method: "GET",
        url: `/invite/${VALID_TOKEN}`,
      });

      expect(response.statusCode).toBe(410);
      const body = response.json();
      expect(body.status).toBe("error");
    });

    it("returns 410 when invite link has expired", async () => {
      const expiredInvite = {
        ...mockActiveInvite,
        expiresAt: new Date("2020-01-01T00:00:00.000Z"),
      };
      mockSelectChain([expiredInvite]);

      const response = await app.inject({
        method: "GET",
        url: `/invite/${VALID_TOKEN}`,
      });

      expect(response.statusCode).toBe(410);
      const body = response.json();
      expect(body.status).toBe("error");
    });
  });

  // ─── POST /invite/:token/register ─────────────────────────────────────

  describe("POST /invite/:token/register — register new student via invite", () => {
    const registerPayload = {
      name: "Student Test",
      email: "student@example.com",
      password: "Password123",
    };

    it("returns 201 and creates user + enrollment for a new student", async () => {
      // invite found and active
      mockSelectChain([mockActiveInvite]);
      // no existing user with that email
      mockSelectChain([]);
      // insert new user
      mockInsert([mockNewUser]);
      // insert enrollment
      mockInsert([mockEnrollment]);

      const response = await app.inject({
        method: "POST",
        url: `/invite/${VALID_TOKEN}/register`,
        payload: registerPayload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.userId).toBe(TEST_USER_ID);
      expect(body.data.enrollmentId).toBe(TEST_ENROLLMENT_ID);
      expect(body.data.courseTitle).toBe("Artisan Bread Baking");
      expect(body.data.status).toBe("pending");
    });

    it("returns 201 and creates enrollment for an existing user not yet enrolled", async () => {
      // invite found and active
      mockSelectChain([mockActiveInvite]);
      // existing user found
      mockSelectChain([{ id: TEST_USER_ID }]);
      // no existing enrollment
      mockSelectChain([]);
      // insert enrollment
      mockInsert([mockEnrollment]);

      const response = await app.inject({
        method: "POST",
        url: `/invite/${VALID_TOKEN}/register`,
        payload: registerPayload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.enrollmentId).toBe(TEST_ENROLLMENT_ID);
      expect(body.data.status).toBe("pending");
    });

    it("returns 201 with existing enrollment when student already registered (idempotent)", async () => {
      const existingEnrollment = {
        id: TEST_ENROLLMENT_ID,
        status: "pending",
      };

      // invite found and active
      mockSelectChain([mockActiveInvite]);
      // existing user found
      mockSelectChain([{ id: TEST_USER_ID }]);
      // existing enrollment found — returns it without creating a duplicate
      mockSelectChain([existingEnrollment]);

      const response = await app.inject({
        method: "POST",
        url: `/invite/${VALID_TOKEN}/register`,
        payload: registerPayload,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.enrollmentId).toBe(TEST_ENROLLMENT_ID);
    });

    it("returns 404 when invite token does not exist", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: "/invite/nonexistent_token/register",
        payload: registerPayload,
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 410 when invite link is revoked", async () => {
      mockSelectChain([{ ...mockActiveInvite, isActive: false }]);

      const response = await app.inject({
        method: "POST",
        url: `/invite/${VALID_TOKEN}/register`,
        payload: registerPayload,
      });

      expect(response.statusCode).toBe(410);
      const body = response.json();
      expect(body.status).toBe("error");
    });

    it("returns 410 when invite link has expired", async () => {
      mockSelectChain([
        {
          ...mockActiveInvite,
          expiresAt: new Date("2020-01-01T00:00:00.000Z"),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/invite/${VALID_TOKEN}/register`,
        payload: registerPayload,
      });

      expect(response.statusCode).toBe(410);
    });

    it("returns 400 when body is missing required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/invite/${VALID_TOKEN}/register`,
        payload: { name: "Test" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 400 when password is too short", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/invite/${VALID_TOKEN}/register`,
        payload: { name: "Test", email: "test@example.com", password: "short" },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
