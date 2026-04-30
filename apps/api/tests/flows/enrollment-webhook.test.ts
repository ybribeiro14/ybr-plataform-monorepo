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
    update: vi.fn(),
  },
  users: {},
  courses: {},
  enrollments: {},
}));

vi.mock("../../src/infrastructure/email/enrollment-emails", () => ({
  sendCourseAccessEmail: vi.fn().mockResolvedValue(undefined),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Proxy-based chainable mock for Drizzle's select() builder.
 * Any method call returns the same proxy. Awaiting the chain resolves with `rows`.
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

const WEBHOOK_SECRET = "test_webhook_secret_for_tests";
const TEST_USER_ID = "usr_01j8n4wbk0000001";
const TEST_COURSE_ID = "crs_01j8n4wbk0000001";
const TEST_ENROLLMENT_ID = "enr_01j8n4wbk0000001";

const mockUser = {
  id: TEST_USER_ID,
  name: "Jane Student",
  email: "jane@example.com",
};

const mockCourse = {
  id: TEST_COURSE_ID,
  title: "Advanced Pastry Arts",
};

const mockEnrollment = {
  id: TEST_ENROLLMENT_ID,
  userId: TEST_USER_ID,
  courseId: TEST_COURSE_ID,
  status: "active",
  enrolledAt: new Date("2024-06-01T00:00:00.000Z"),
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Enrollment Webhook Flow", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env["WEBHOOK_ENROLLMENT_SECRET"] = WEBHOOK_SECRET;
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── POST /webhooks/enrollment ─────────────────────────────────────────

  describe("POST /webhooks/enrollment — new enrollment", () => {
    it("returns 200 and creates enrollment for a valid request", async () => {
      // user found
      mockSelectChain([mockUser]);
      // course found
      mockSelectChain([mockCourse]);
      // no existing enrollment
      mockSelectChain([]);
      // insert new enrollment
      mockInsert([mockEnrollment]);

      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        payload: {
          userId: TEST_USER_ID,
          courseId: TEST_COURSE_ID,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.enrollmentId).toBe(TEST_ENROLLMENT_ID);
      expect(body.data.userId).toBe(TEST_USER_ID);
      expect(body.data.courseId).toBe(TEST_COURSE_ID);
      expect(body.data.status).toBe("active");
    });

    it("returns 200 with existing enrollment when already active (idempotent)", async () => {
      // user found
      mockSelectChain([mockUser]);
      // course found
      mockSelectChain([mockCourse]);
      // existing active enrollment found — idempotent
      mockSelectChain([{ id: TEST_ENROLLMENT_ID, status: "active" }]);

      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        payload: {
          userId: TEST_USER_ID,
          courseId: TEST_COURSE_ID,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.enrollmentId).toBe(TEST_ENROLLMENT_ID);
      expect(body.data.status).toBe("active");
    });

    it("returns 200 and activates a pending enrollment", async () => {
      const updatedEnrollment = { ...mockEnrollment, status: "active" };

      // user found
      mockSelectChain([mockUser]);
      // course found
      mockSelectChain([mockCourse]);
      // existing pending enrollment
      mockSelectChain([{ id: TEST_ENROLLMENT_ID, status: "pending" }]);
      // update enrollment → active
      vi.mocked(db.update).mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedEnrollment]),
          }),
        }),
      } as ReturnType<typeof db.update>);

      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        payload: {
          userId: TEST_USER_ID,
          courseId: TEST_COURSE_ID,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.status).toBe("active");
    });

    it("returns 400 when webhook secret header is missing", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        payload: {
          userId: TEST_USER_ID,
          courseId: TEST_COURSE_ID,
        },
      });

      // Zod schema requires the x-webhook-secret header — missing header = 400
      expect(response.statusCode).toBe(400);
    });

    it("returns 401 when webhook secret is wrong", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        headers: { "x-webhook-secret": "wrong_secret" },
        payload: {
          userId: TEST_USER_ID,
          courseId: TEST_COURSE_ID,
        },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json();
      expect(body.status).toBe("error");
      expect(body.errors[0].code).toBe("INVALID_WEBHOOK_SECRET");
    });

    it("returns 404 when user does not exist", async () => {
      // user not found
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        payload: {
          userId: "nonexistent_user_id",
          courseId: TEST_COURSE_ID,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 404 when course does not exist or is not published", async () => {
      // user found
      mockSelectChain([mockUser]);
      // course not found
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        payload: {
          userId: TEST_USER_ID,
          courseId: "nonexistent_course_id",
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 400 when body is missing required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/webhooks/enrollment",
        headers: { "x-webhook-secret": WEBHOOK_SECRET },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
