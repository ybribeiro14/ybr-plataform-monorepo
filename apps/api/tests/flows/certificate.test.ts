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
  certificates: {},
  creators: {},
  lessons: {},
  courseModules: {},
  lessonProgress: {},
}));

vi.mock("../../src/infrastructure/storage/r2", () => ({
  r2: { send: vi.fn().mockResolvedValue({}) },
  R2_BUCKET: "ybr-platform-test",
  R2_PUBLIC_URL: "https://test.r2.dev",
}));

vi.mock("pdf-lib", () => {
  const mockPage = {
    drawText: vi.fn(),
    drawRectangle: vi.fn(),
    getSize: vi.fn().mockReturnValue({ width: 841.89, height: 595.28 }),
  };
  const mockPdfDoc = {
    addPage: vi.fn().mockReturnValue(mockPage),
    embedFont: vi.fn().mockResolvedValue({
      widthOfTextAtSize: vi.fn().mockReturnValue(100),
    }),
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  };
  return {
    PDFDocument: {
      create: vi.fn().mockResolvedValue(mockPdfDoc),
    },
    StandardFonts: {
      Helvetica: "Helvetica",
      HelveticaBold: "Helvetica-Bold",
      HelveticaOblique: "Helvetica-Oblique",
    },
    rgb: vi.fn().mockReturnValue({}),
  };
});

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

const TEST_USER_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d001";
const TEST_COURSE_ID = "b2c3d4e5-f6a7-8901-bcde-f01234567001";
const TEST_ENROLLMENT_ID = "c3d4e5f6-a7b8-9012-cdef-012345678001";
const TEST_CERT_ID = "cert_01j8n4wbk0000001";
const TEST_VERIFY_CODE = "01j8n4wb-verification-code-0001";

const mockEnrollmentRow = {
  id: TEST_ENROLLMENT_ID,
  status: "active",
};

const mockExistingCert = {
  id: TEST_CERT_ID,
  verificationCode: TEST_VERIFY_CODE,
  certificateUrl: "https://test.r2.dev/certificates/existing.pdf",
  issuedAt: new Date("2024-06-01T00:00:00.000Z"),
};

const mockCourseInfo = {
  courseTitle: "Artisan Bread Baking",
  creatorName: "Chef Maria",
};

const mockStudentInfo = {
  name: "Jane Student",
};

const mockNewCert = {
  id: TEST_CERT_ID,
  verificationCode: TEST_VERIFY_CODE,
  certificateUrl: `https://test.r2.dev/certificates/${TEST_VERIFY_CODE}.pdf`,
  issuedAt: new Date("2024-06-01T00:00:00.000Z"),
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Certificate Flow", () => {
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

  // ─── POST /student/certificates/generate ─────────────────────────────

  describe("POST /student/certificates/generate", () => {
    it("returns 201 and generates a new certificate for a completed course", async () => {
      // enrollment active
      mockSelectChain([mockEnrollmentRow]);
      // no existing certificate
      mockSelectChain([]);
      // course info
      mockSelectChain([mockCourseInfo]);
      // student info
      mockSelectChain([mockStudentInfo]);
      // total lessons count
      mockSelectChain([{ totalLessons: 3 }]);
      // completed lessons count
      mockSelectChain([{ completedLessons: 3 }]);
      // insert certificate
      mockInsert([mockNewCert]);

      const response = await app.inject({
        method: "POST",
        url: "/student/certificates/generate",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { courseId: TEST_COURSE_ID },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.certificateId).toBe(TEST_CERT_ID);
      expect(body.data.verificationCode).toBe(TEST_VERIFY_CODE);
      expect(body.data.certificateUrl).toBeDefined();
      expect(body.data.studentName).toBe("Jane Student");
      expect(body.data.courseTitle).toBe("Artisan Bread Baking");
    });

    it("returns 201 with existing certificate when already generated (idempotent)", async () => {
      // enrollment active
      mockSelectChain([mockEnrollmentRow]);
      // existing certificate found
      mockSelectChain([mockExistingCert]);
      // course info
      mockSelectChain([mockCourseInfo]);
      // student info
      mockSelectChain([mockStudentInfo]);

      const response = await app.inject({
        method: "POST",
        url: "/student/certificates/generate",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { courseId: TEST_COURSE_ID },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.certificateId).toBe(TEST_CERT_ID);
      expect(body.data.verificationCode).toBe(TEST_VERIFY_CODE);
    });

    it("returns 400 when course is not fully completed", async () => {
      // enrollment active
      mockSelectChain([mockEnrollmentRow]);
      // no existing certificate
      mockSelectChain([]);
      // course info
      mockSelectChain([mockCourseInfo]);
      // student info
      mockSelectChain([mockStudentInfo]);
      // total lessons: 5, completed: 3 — not finished
      mockSelectChain([{ totalLessons: 5 }]);
      mockSelectChain([{ completedLessons: 3 }]);

      const response = await app.inject({
        method: "POST",
        url: "/student/certificates/generate",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { courseId: TEST_COURSE_ID },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.status).toBe("error");
    });

    it("returns 403 when student has no active enrollment", async () => {
      // no active enrollment
      mockSelectChain([]);

      const response = await app.inject({
        method: "POST",
        url: "/student/certificates/generate",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { courseId: TEST_COURSE_ID },
      });

      expect(response.statusCode).toBe(403);
    });

    it("returns 401 when request is not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/student/certificates/generate",
        payload: { courseId: TEST_COURSE_ID },
      });

      expect(response.statusCode).toBe(401);
    });

    it("returns 400 when courseId is not a valid UUID", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/student/certificates/generate",
        headers: { authorization: `Bearer ${authToken}` },
        payload: { courseId: "not-a-uuid" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ─── GET /certificates/:code/verify ──────────────────────────────────

  describe("GET /certificates/:code/verify", () => {
    const mockCertRow = {
      id: TEST_CERT_ID,
      verificationCode: TEST_VERIFY_CODE,
      certificateUrl: "https://test.r2.dev/certificates/cert.pdf",
      issuedAt: new Date("2024-06-01T00:00:00.000Z"),
      studentName: "Jane Student",
      courseTitle: "Artisan Bread Baking",
      creatorName: "Chef Maria",
    };

    it("returns 200 with full certificate details for a valid code", async () => {
      mockSelectChain([mockCertRow]);

      const response = await app.inject({
        method: "GET",
        url: `/certificates/${TEST_VERIFY_CODE}/verify`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe("success");
      expect(body.data.certificateId).toBe(TEST_CERT_ID);
      expect(body.data.verificationCode).toBe(TEST_VERIFY_CODE);
      expect(body.data.studentName).toBe("Jane Student");
      expect(body.data.courseTitle).toBe("Artisan Bread Baking");
      expect(body.data.creatorName).toBe("Chef Maria");
      expect(body.data.issuedAt).toBeDefined();
    });

    it("returns 404 when verification code does not exist", async () => {
      mockSelectChain([]);

      const response = await app.inject({
        method: "GET",
        url: "/certificates/invalid-code-does-not-exist/verify",
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
