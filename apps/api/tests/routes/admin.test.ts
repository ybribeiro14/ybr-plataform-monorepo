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
    query: {
      users: { findFirst: vi.fn() },
      creators: { findFirst: vi.fn() },
    },
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  users: {},
  creators: {},
  courses: {},
  courseModules: {},
  lessons: {},
}));

vi.mock("../../src/infrastructure/video/bunny", () => ({
  createBunnyVideo: vi.fn(),
}));

vi.mock("../../src/infrastructure/storage/r2", () => ({
  r2: { send: vi.fn().mockResolvedValue({}) },
  R2_BUCKET: "ybr-platform-test",
  R2_PUBLIC_URL: "https://test.r2.dev",
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Creates a Proxy-based chainable mock for Drizzle's select() builder.
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

const mockUpdate = (rows: unknown[] = []) => {
  vi.mocked(db.update).mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(rows),
      }),
    }),
  } as ReturnType<typeof db.update>);
};

const mockDelete = () => {
  vi.mocked(db.delete).mockReturnValue({
    where: vi.fn().mockResolvedValue([]),
  } as ReturnType<typeof db.delete>);
};

// ─── Test data ──────────────────────────────────────────────────────────────

const TEST_USER_ID = "usr_01test001";
const TEST_CREATOR_ID = "crt_01test001";
const TEST_COURSE_ID = "crs_01test001";
const TEST_MODULE_ID = "mod_01test001";
const TEST_LESSON_ID = "les_01test001";

const mockCourse = {
  id: TEST_COURSE_ID,
  creatorId: TEST_CREATOR_ID,
  title: "Test Course",
  slug: "test-course",
  description: null,
  thumbnailUrl: null,
  priceCents: 9900,
  currency: "USD",
  status: "draft",
  language: "pt-BR",
  createdAt: new Date("2024-01-01").toISOString(),
  updatedAt: new Date("2024-01-01").toISOString(),
};

const mockModule = {
  id: TEST_MODULE_ID,
  courseId: TEST_COURSE_ID,
  title: "Module 1",
  description: null,
  position: 0,
  isPublished: false,
  createdAt: new Date("2024-01-01").toISOString(),
  updatedAt: new Date("2024-01-01").toISOString(),
};

const mockLesson = {
  id: TEST_LESSON_ID,
  moduleId: TEST_MODULE_ID,
  title: "Lesson 1",
  description: null,
  bunnyVideoId: null,
  muxAssetId: null,
  muxPlaybackId: null,
  durationSeconds: null,
  position: 0,
  isFreePreview: false,
  isPublished: false,
  createdAt: new Date("2024-01-01").toISOString(),
  updatedAt: new Date("2024-01-01").toISOString(),
};

// ─── Test suite ─────────────────────────────────────────────────────────────

describe("Admin Routes — Integration", () => {
  let app: FastifyInstance;
  let creatorToken: string;
  let studentToken: string;

  beforeAll(async () => {
    app = await buildTestApp();
    creatorToken = await app.jwt.sign(
      { sub: TEST_USER_ID, role: "creator" },
      { expiresIn: "1h" },
    );
    studentToken = await app.jwt.sign(
      { sub: TEST_USER_ID, role: "student" },
      { expiresIn: "1h" },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Always resolve requireCreator's db.query.creators.findFirst with a valid creator
    vi.mocked(db.query.creators.findFirst).mockResolvedValue({
      id: TEST_CREATOR_ID,
    } as never);
  });

  // ─── GET /admin/courses ────────────────────────────────────────────────────

  describe("GET /admin/courses", () => {
    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/admin/courses",
      });
      expect(response.statusCode).toBe(401);
    });

    it("returns 403 for student role", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/admin/courses",
        headers: { authorization: `Bearer ${studentToken}` },
      });
      expect(response.statusCode).toBe(403);
    });

    it("returns 200 with course list for creator", async () => {
      mockSelectChain([{ ...mockCourse, moduleCount: 2, lessonCount: 5 }]);

      const response = await app.inject({
        method: "GET",
        url: "/admin/courses",
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data[0].id).toBe(TEST_COURSE_ID);
    });
  });

  // ─── POST /admin/courses ───────────────────────────────────────────────────

  describe("POST /admin/courses", () => {
    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/admin/courses",
        payload: { title: "New Course", priceCents: 9900 },
      });
      expect(response.statusCode).toBe(401);
    });

    it("returns 400 for missing required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/admin/courses",
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });

    it("creates a course and returns 201", async () => {
      // Mock slug uniqueness check (no existing slugs)
      mockSelectChain([]);
      // Mock insert returning new course
      mockInsert([mockCourse]);

      const response = await app.inject({
        method: "POST",
        url: "/admin/courses",
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: {
          title: "Test Course",
          priceCents: 9900,
          currency: "USD",
          language: "pt-BR",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.title).toBe("Test Course");
    });
  });

  // ─── GET /admin/courses/:courseId ──────────────────────────────────────────

  describe("GET /admin/courses/:courseId", () => {
    it("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/admin/courses/${TEST_COURSE_ID}`,
      });
      expect(response.statusCode).toBe(401);
    });

    it("returns 404 when course not found", async () => {
      // First select: course lookup returns empty
      mockSelectChain([]);

      const response = await app.inject({
        method: "GET",
        url: `/admin/courses/${TEST_COURSE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 200 with course details", async () => {
      // First select: course
      mockSelectChain([mockCourse]);
      // Second select: modules
      mockSelectChain([mockModule]);
      // Third select: lessons
      mockSelectChain([mockLesson]);

      const response = await app.inject({
        method: "GET",
        url: `/admin/courses/${TEST_COURSE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.id).toBe(TEST_COURSE_ID);
      expect(Array.isArray(body.data.modules)).toBe(true);
    });
  });

  // ─── PATCH /admin/courses/:courseId ───────────────────────────────────────

  describe("PATCH /admin/courses/:courseId", () => {
    it("returns 404 when course not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "PATCH",
        url: `/admin/courses/${TEST_COURSE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Updated Title" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("updates course and returns 200", async () => {
      mockSelectChain([{ id: TEST_COURSE_ID }]);
      mockUpdate([{ ...mockCourse, title: "Updated Title" }]);

      const response = await app.inject({
        method: "PATCH",
        url: `/admin/courses/${TEST_COURSE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Updated Title" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
    });
  });

  // ─── DELETE /admin/courses/:courseId ──────────────────────────────────────

  describe("DELETE /admin/courses/:courseId", () => {
    it("returns 404 when course not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "DELETE",
        url: `/admin/courses/${TEST_COURSE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("archives course and returns 200", async () => {
      mockSelectChain([{ id: TEST_COURSE_ID }]);
      mockUpdate([]);

      const response = await app.inject({
        method: "DELETE",
        url: `/admin/courses/${TEST_COURSE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
    });
  });

  // ─── POST /admin/courses/:courseId/publish ────────────────────────────────

  describe("POST /admin/courses/:courseId/publish", () => {
    it("returns 404 when course not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/courses/${TEST_COURSE_ID}/publish`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 400 when course has no content", async () => {
      // Course found
      mockSelectChain([{ id: TEST_COURSE_ID }]);
      // No modules with lessons
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/courses/${TEST_COURSE_ID}/publish`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.errors[0].code).toBe("NO_CONTENT");
    });

    it("publishes course when content exists", async () => {
      mockSelectChain([{ id: TEST_COURSE_ID }]);
      mockSelectChain([{ moduleId: TEST_MODULE_ID }]);
      mockUpdate([{ ...mockCourse, status: "published" }]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/courses/${TEST_COURSE_ID}/publish`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
    });
  });

  // ─── POST /admin/courses/:courseId/modules ────────────────────────────────

  describe("POST /admin/courses/:courseId/modules", () => {
    it("returns 201 with created module", async () => {
      // Course ownership check
      mockSelectChain([{ id: TEST_COURSE_ID }]);
      // Max position query
      mockSelectChain([{ maxPosition: null }]);
      // Insert module
      mockInsert([mockModule]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/courses/${TEST_COURSE_ID}/modules`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Module 1" },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.title).toBe("Module 1");
    });

    it("returns 404 when course not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/courses/${TEST_COURSE_ID}/modules`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Module 1" },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ─── PATCH /admin/modules/reorder ─────────────────────────────────────────

  describe("PATCH /admin/modules/reorder", () => {
    it("returns 200 after reordering", async () => {
      // Ownership check (all modules found)
      mockSelectChain([{ id: TEST_MODULE_ID }]);
      // Multiple update calls mocked
      mockUpdate([]);
      mockUpdate([]);

      const response = await app.inject({
        method: "PATCH",
        url: "/admin/modules/reorder",
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: {
          modules: [{ id: TEST_MODULE_ID, position: 0 }],
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
    });

    it("returns 403 when module not owned", async () => {
      // Fewer owned modules than requested
      mockSelectChain([]);

      const response = await app.inject({
        method: "PATCH",
        url: "/admin/modules/reorder",
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: {
          modules: [{ id: TEST_MODULE_ID, position: 0 }],
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  // ─── PATCH /admin/modules/:moduleId ───────────────────────────────────────

  describe("PATCH /admin/modules/:moduleId", () => {
    it("returns 200 after updating", async () => {
      mockSelectChain([{ id: TEST_MODULE_ID, courseId: TEST_COURSE_ID }]);
      mockSelectChain([{ id: TEST_COURSE_ID, creatorId: TEST_CREATOR_ID }]);
      mockUpdate([{ ...mockModule, title: "Updated Module" }]);

      const response = await app.inject({
        method: "PATCH",
        url: `/admin/modules/${TEST_MODULE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Updated Module" },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  // ─── DELETE /admin/modules/:moduleId ──────────────────────────────────────

  describe("DELETE /admin/modules/:moduleId", () => {
    it("returns 200 after deleting", async () => {
      mockSelectChain([{ id: TEST_MODULE_ID, courseId: TEST_COURSE_ID }]);
      mockSelectChain([{ id: TEST_COURSE_ID, creatorId: TEST_CREATOR_ID }]);
      mockDelete();

      const response = await app.inject({
        method: "DELETE",
        url: `/admin/modules/${TEST_MODULE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(200);
    });

    it("returns 404 when module not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "DELETE",
        url: `/admin/modules/${TEST_MODULE_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ─── POST /admin/modules/:moduleId/lessons ────────────────────────────────

  describe("POST /admin/modules/:moduleId/lessons", () => {
    it("returns 201 with created lesson", async () => {
      mockSelectChain([{ id: TEST_MODULE_ID, creatorId: TEST_CREATOR_ID }]);
      mockSelectChain([{ maxPosition: null }]);
      mockInsert([mockLesson]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/modules/${TEST_MODULE_ID}/lessons`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Lesson 1" },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.title).toBe("Lesson 1");
    });

    it("returns 404 when module not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/modules/${TEST_MODULE_ID}/lessons`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Lesson 1" },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ─── PATCH /admin/lessons/:lessonId ───────────────────────────────────────

  describe("PATCH /admin/lessons/:lessonId", () => {
    it("returns 200 after updating", async () => {
      mockSelectChain([{ id: TEST_LESSON_ID, creatorId: TEST_CREATOR_ID }]);
      mockUpdate([{ ...mockLesson, title: "Updated Lesson" }]);

      const response = await app.inject({
        method: "PATCH",
        url: `/admin/lessons/${TEST_LESSON_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Updated Lesson" },
      });

      expect(response.statusCode).toBe(200);
    });

    it("returns 404 when lesson not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "PATCH",
        url: `/admin/lessons/${TEST_LESSON_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
        payload: { title: "Updated Lesson" },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ─── DELETE /admin/lessons/:lessonId ──────────────────────────────────────

  describe("DELETE /admin/lessons/:lessonId", () => {
    it("returns 200 after deleting", async () => {
      mockSelectChain([{ id: TEST_LESSON_ID, creatorId: TEST_CREATOR_ID }]);
      mockDelete();

      const response = await app.inject({
        method: "DELETE",
        url: `/admin/lessons/${TEST_LESSON_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(200);
    });

    it("returns 404 when lesson not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "DELETE",
        url: `/admin/lessons/${TEST_LESSON_ID}`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  // ─── POST /admin/lessons/:lessonId/video ──────────────────────────────────

  describe("POST /admin/lessons/:lessonId/video", () => {
    it("returns 404 when lesson not found", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: `/admin/lessons/${TEST_LESSON_ID}/video`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(404);
    });

    it("returns 200 with upload credentials", async () => {
      const { createBunnyVideo } =
        await import("../../src/infrastructure/video/bunny");

      mockSelectChain([
        { id: TEST_LESSON_ID, title: "Lesson 1", creatorId: TEST_CREATOR_ID },
      ]);
      mockUpdate([]);
      vi.mocked(createBunnyVideo).mockResolvedValueOnce({
        videoId: "bunny-guid-001",
        uploadUrl: "https://video.bunnycdn.com/tusupload",
        authSignature: "abc123",
        authExpire: 9999999999,
        libraryId: "12345",
      });

      const response = await app.inject({
        method: "POST",
        url: `/admin/lessons/${TEST_LESSON_ID}/video`,
        headers: { authorization: `Bearer ${creatorToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.videoId).toBe("bunny-guid-001");
      expect(body.data.uploadUrl).toBe("https://video.bunnycdn.com/tusupload");
    });
  });
});
