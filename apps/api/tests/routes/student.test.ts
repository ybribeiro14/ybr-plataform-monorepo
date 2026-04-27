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
  lessons: {},
  courseModules: {},
  courses: {},
  enrollments: {},
  lessonProgress: {},
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

const mockUpdate = (rows: unknown[] = []) => {
  vi.mocked(db.update).mockReturnValueOnce({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(rows),
      }),
    }),
  } as ReturnType<typeof db.update>);
};

// ─── Test data ───────────────────────────────────────────────────────────────

const TEST_USER_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const TEST_LESSON_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const TEST_COURSE_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567891";
const TEST_ENROLLMENT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678912";
const TEST_PROGRESS_ID = "d4e5f6a7-b8c9-0123-defa-123456789023";
const TEST_BUNNY_VIDEO_ID = "bunny-video-guid-12345";

const mockLessonRow = {
  lessonId: TEST_LESSON_ID,
  title: "Introduction to Baking",
  bunnyVideoId: TEST_BUNNY_VIDEO_ID,
  durationSeconds: 600,
  courseId: TEST_COURSE_ID,
  thumbnailUrl: "https://example.com/thumb.jpg",
};

const mockEnrollmentRow = { id: TEST_ENROLLMENT_ID };

const mockProgressRow = {
  watchedSeconds: 120,
  completedAt: null,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Student Routes", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    app = await buildTestApp();
    authToken = await app.jwt.sign(
      { sub: TEST_USER_ID, role: "student" },
      { expiresIn: "1h" },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── GET /student/lessons/:lessonId/stream ──────────────────────────────

  describe("GET /student/lessons/:lessonId/stream", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/student/lessons/${TEST_LESSON_ID}/stream`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 400 when lessonId is not a valid UUID", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/student/lessons/not-a-uuid/stream",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 404 when the lesson does not exist", async () => {
      // Call 1: lesson lookup returns nothing
      mockSelectChain([]);

      const response = await app.inject({
        method: "GET",
        url: `/student/lessons/${TEST_LESSON_ID}/stream`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.errors[0].code).toBe("LESSON_NOT_FOUND");
    });

    it("returns 403 when the user is not enrolled in the course", async () => {
      // Call 1: lesson lookup succeeds
      mockSelectChain([mockLessonRow]);
      // Call 2: enrollment lookup returns nothing
      mockSelectChain([]);

      const response = await app.inject({
        method: "GET",
        url: `/student/lessons/${TEST_LESSON_ID}/stream`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(403);
      const body = response.json();
      expect(body.errors[0].code).toBe("NOT_ENROLLED");
    });

    it("returns 404 when the lesson has no bunny_video_id", async () => {
      // Call 1: lesson with no video
      mockSelectChain([{ ...mockLessonRow, bunnyVideoId: null }]);
      // Call 2: enrollment ok
      mockSelectChain([mockEnrollmentRow]);

      const response = await app.inject({
        method: "GET",
        url: `/student/lessons/${TEST_LESSON_ID}/stream`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.errors[0].code).toBe("VIDEO_NOT_AVAILABLE");
    });

    it("returns 200 with stream URL and no progress when user has not started the lesson", async () => {
      // Call 1: lesson
      mockSelectChain([mockLessonRow]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: progress (none yet)
      mockSelectChain([]);

      const response = await app.inject({
        method: "GET",
        url: `/student/lessons/${TEST_LESSON_ID}/stream`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.lessonId).toBe(TEST_LESSON_ID);
      expect(body.data.title).toBe("Introduction to Baking");
      expect(body.data.streamUrl).toBe(
        `https://test-video.b-cdn.net/${TEST_BUNNY_VIDEO_ID}/playlist.m3u8`,
      );
      expect(body.data.thumbnailUrl).toBe("https://example.com/thumb.jpg");
      expect(body.data.durationSeconds).toBe(600);
      expect(body.data.progress).toBeNull();
    });

    it("returns 200 with existing progress when user has watched part of the lesson", async () => {
      // Call 1: lesson
      mockSelectChain([mockLessonRow]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: progress exists
      mockSelectChain([mockProgressRow]);

      const response = await app.inject({
        method: "GET",
        url: `/student/lessons/${TEST_LESSON_ID}/stream`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.progress).toEqual({
        watchedSeconds: 120,
        completed: false,
      });
    });

    it("returns completed: true in progress when completedAt is set", async () => {
      // Call 1: lesson
      mockSelectChain([mockLessonRow]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: progress with completedAt set
      mockSelectChain([{ watchedSeconds: 600, completedAt: new Date() }]);

      const response = await app.inject({
        method: "GET",
        url: `/student/lessons/${TEST_LESSON_ID}/stream`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.progress.completed).toBe(true);
    });
  });

  // ─── POST /student/lessons/:lessonId/progress ───────────────────────────

  describe("POST /student/lessons/:lessonId/progress", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        payload: { watchedSeconds: 100 },
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 400 when lessonId is not a valid UUID", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/student/lessons/not-a-uuid/progress",
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 100 },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 400 when watchedSeconds is negative", async () => {
      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: -1 },
      });

      expect(response.statusCode).toBe(400);
    });

    it("returns 404 when the lesson does not exist", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 100 },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().errors[0].code).toBe("LESSON_NOT_FOUND");
    });

    it("returns 403 when the user is not enrolled", async () => {
      // Call 1: lesson info
      mockSelectChain([{ durationSeconds: 600, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment not found
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 100 },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json().errors[0].code).toBe("NOT_ENROLLED");
    });

    it("creates a new progress record when none exists", async () => {
      // Call 1: lesson info
      mockSelectChain([{ durationSeconds: 600, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: existing progress (none)
      mockSelectChain([]);
      // Insert new record
      mockInsert([
        {
          id: TEST_PROGRESS_ID,
          userId: TEST_USER_ID,
          lessonId: TEST_LESSON_ID,
          watchedSeconds: 120,
          completedAt: null,
          lastWatchedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 120 },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.watchedSeconds).toBe(120);
      expect(body.data.completed).toBe(false);
      expect(body.data.completedAt).toBeNull();
    });

    it("updates an existing progress record", async () => {
      // Call 1: lesson info
      mockSelectChain([{ durationSeconds: 600, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: existing progress record found
      mockSelectChain([{ id: TEST_PROGRESS_ID, completedAt: null }]);
      // Update
      mockUpdate([
        {
          id: TEST_PROGRESS_ID,
          userId: TEST_USER_ID,
          lessonId: TEST_LESSON_ID,
          watchedSeconds: 300,
          completedAt: null,
          lastWatchedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 300 },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.watchedSeconds).toBe(300);
      expect(body.data.completed).toBe(false);
    });

    it("auto-completes the lesson when watchedSeconds reaches 90% of duration (new record)", async () => {
      const durationSeconds = 600;
      const watchedSeconds = 540; // exactly 90%

      // Call 1: lesson info
      mockSelectChain([{ durationSeconds, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: no existing record
      mockSelectChain([]);
      // Insert with completedAt set
      mockInsert([
        {
          id: TEST_PROGRESS_ID,
          userId: TEST_USER_ID,
          lessonId: TEST_LESSON_ID,
          watchedSeconds,
          completedAt: new Date("2026-04-27T12:00:00Z"),
          lastWatchedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.completed).toBe(true);
      expect(body.data.completedAt).not.toBeNull();
    });

    it("auto-completes the lesson when updating an existing incomplete record past 90%", async () => {
      const watchedSeconds = 550; // > 90% of 600

      // Call 1: lesson info
      mockSelectChain([{ durationSeconds: 600, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: existing record without completedAt
      mockSelectChain([{ id: TEST_PROGRESS_ID, completedAt: null }]);
      // Update sets completedAt
      mockUpdate([
        {
          id: TEST_PROGRESS_ID,
          userId: TEST_USER_ID,
          lessonId: TEST_LESSON_ID,
          watchedSeconds,
          completedAt: new Date("2026-04-27T12:00:00Z"),
          lastWatchedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.completed).toBe(true);
      expect(body.data.completedAt).not.toBeNull();
    });

    it("does not overwrite completedAt when lesson was already completed", async () => {
      const alreadyCompletedAt = new Date("2026-04-20T10:00:00Z");

      // Call 1: lesson info
      mockSelectChain([{ durationSeconds: 600, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: existing record that is already completed
      mockSelectChain([
        { id: TEST_PROGRESS_ID, completedAt: alreadyCompletedAt },
      ]);
      // Update — completedAt should NOT change
      mockUpdate([
        {
          id: TEST_PROGRESS_ID,
          userId: TEST_USER_ID,
          lessonId: TEST_LESSON_ID,
          watchedSeconds: 600,
          completedAt: alreadyCompletedAt,
          lastWatchedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 600 },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.completed).toBe(true);
      expect(body.data.completedAt).toBe(alreadyCompletedAt.toISOString());
    });

    it("does not mark as completed when watchedSeconds is below 90% threshold", async () => {
      // Call 1: lesson info (600s duration)
      mockSelectChain([{ durationSeconds: 600, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: no existing record
      mockSelectChain([]);
      // Insert without completedAt
      mockInsert([
        {
          id: TEST_PROGRESS_ID,
          userId: TEST_USER_ID,
          lessonId: TEST_LESSON_ID,
          watchedSeconds: 530, // 88.3% — below threshold
          completedAt: null,
          lastWatchedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 530 },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.completed).toBe(false);
    });

    it("accepts watchedSeconds of 0", async () => {
      // Call 1: lesson info
      mockSelectChain([{ durationSeconds: 600, courseId: TEST_COURSE_ID }]);
      // Call 2: enrollment
      mockSelectChain([mockEnrollmentRow]);
      // Call 3: no existing record
      mockSelectChain([]);
      // Insert
      mockInsert([
        {
          id: TEST_PROGRESS_ID,
          userId: TEST_USER_ID,
          lessonId: TEST_LESSON_ID,
          watchedSeconds: 0,
          completedAt: null,
          lastWatchedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: "POST",
        url: `/student/lessons/${TEST_LESSON_ID}/progress`,
        headers: { Authorization: `Bearer ${authToken}` },
        payload: { watchedSeconds: 0 },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().data.watchedSeconds).toBe(0);
    });
  });
});
