import {
  createCourseSchema,
  createLessonSchema,
  createModuleSchema,
  reorderLessonsSchema,
  reorderModulesSchema,
  updateCourseSchema,
  updateLessonSchema,
  updateModuleSchema,
} from "@ybr/schemas";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  activateEnrollment,
  createCourse,
  createInviteLink,
  createLesson,
  createModule,
  createVideoUpload,
  deleteCourse,
  deleteLesson,
  deleteLessonVideo,
  deleteModule,
  getCourse,
  listCourses,
  listInviteLinks,
  listPendingEnrollments,
  publishCourse,
  reorderLessons,
  reorderModules,
  revokeEnrollment,
  revokeInviteLink,
  updateCourse,
  updateLesson,
  updateModule,
  uploadThumbnail,
} from "../../functions/admin";
import {
  errorResponse,
  RESPONSE_401,
  RESPONSE_403,
  RESPONSE_404,
  successResponse,
} from "../../swagger/responses";
import { BEARER_AUTH } from "../../swagger/security";
import { SWAGGER_TAGS } from "../../swagger/tags";

const courseSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  priceCents: z.number(),
  currency: z.string(),
  status: z.string(),
  language: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

const courseWithCountsSchema = courseSchema.extend({
  moduleCount: z.number(),
  lessonCount: z.number(),
});

const moduleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  position: z.number(),
  isPublished: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

const lessonSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  bunnyVideoId: z.string().nullable(),
  muxAssetId: z.string().nullable(),
  muxPlaybackId: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  position: z.number(),
  isFreePreview: z.boolean(),
  isPublished: z.boolean(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

const courseWithModulesSchema = courseSchema.extend({
  modules: z.array(
    moduleSchema.extend({
      lessons: z.array(lessonSchema),
    }),
  ),
});

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

const adminRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // ─── Courses ────────────────────────────────────────────────────────────────

  // GET /admin/courses
  app.get(
    "/admin/courses",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "List all courses for the authenticated creator",
        security: BEARER_AUTH,
        response: {
          200: successResponse(z.array(courseWithCountsSchema)),
          401: RESPONSE_401,
          403: RESPONSE_403,
        },
      },
    },
    async (request, reply) => {
      const courses = await listCourses({ creatorId: request.creatorId });
      return reply.send({
        status: "success" as const,
        message: "Courses retrieved successfully",
        data: courses,
      });
    },
  );

  // POST /admin/courses
  app.post(
    "/admin/courses",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Create a new course (draft)",
        security: BEARER_AUTH,
        body: createCourseSchema,
        response: {
          201: successResponse(courseSchema),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
        },
      },
    },
    async (request, reply) => {
      const course = await createCourse({
        ...request.body,
        creatorId: request.creatorId,
      });
      return reply.status(201).send({
        status: "success" as const,
        message: "Course created successfully",
        // biome-ignore lint/style/noNonNullAssertion: createCourse throws before returning undefined
        data: course!,
      });
    },
  );

  // GET /admin/courses/:courseId
  app.get(
    "/admin/courses/:courseId",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Get a course with all modules and lessons",
        security: BEARER_AUTH,
        params: z.object({ courseId: z.string() }),
        response: {
          200: successResponse(courseWithModulesSchema),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const course = await getCourse({
        courseId: request.params.courseId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Course retrieved successfully",
        data: course,
      });
    },
  );

  // PATCH /admin/courses/:courseId
  app.patch(
    "/admin/courses/:courseId",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Update course details",
        security: BEARER_AUTH,
        params: z.object({ courseId: z.string() }),
        body: updateCourseSchema,
        response: {
          200: successResponse(courseSchema),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const course = await updateCourse({
        courseId: request.params.courseId,
        creatorId: request.creatorId,
        data: request.body,
      });
      return reply.send({
        status: "success" as const,
        message: "Course updated successfully",
        // biome-ignore lint/style/noNonNullAssertion: updateCourse throws before returning undefined
        data: course!,
      });
    },
  );

  // DELETE /admin/courses/:courseId
  app.delete(
    "/admin/courses/:courseId",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Archive a course (soft delete)",
        security: BEARER_AUTH,
        params: z.object({ courseId: z.string() }),
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      await deleteCourse({
        courseId: request.params.courseId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Course archived successfully",
        data: { message: "Course has been archived" },
      });
    },
  );

  // POST /admin/courses/:courseId/publish
  app.post(
    "/admin/courses/:courseId/publish",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary:
          "Publish a course (requires at least one module with one lesson)",
        security: BEARER_AUTH,
        params: z.object({ courseId: z.string() }),
        response: {
          200: successResponse(courseSchema),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const course = await publishCourse({
        courseId: request.params.courseId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Course published successfully",
        // biome-ignore lint/style/noNonNullAssertion: publishCourse throws before returning undefined
        data: course!,
      });
    },
  );

  // POST /admin/courses/:courseId/thumbnail
  app.post(
    "/admin/courses/:courseId/thumbnail",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Upload course thumbnail (multipart/form-data, max 5MB)",
        security: BEARER_AUTH,
        consumes: ["multipart/form-data"],
        params: z.object({ courseId: z.string() }),
        response: {
          200: successResponse(z.object({ thumbnailUrl: z.string() })),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const file = await request.file({
        limits: { fileSize: MAX_THUMBNAIL_SIZE },
      });

      if (!file) {
        return reply.status(400).send({
          status: "error" as const,
          message: "No file uploaded",
          errors: [
            {
              code: "NO_FILE",
              detail: "A file must be provided in the request.",
            },
          ],
        });
      }

      const extension = ALLOWED_IMAGE_TYPES[file.mimetype];

      if (!extension) {
        return reply.status(400).send({
          status: "error" as const,
          message: "Invalid file type",
          errors: [
            {
              code: "INVALID_FILE_TYPE",
              detail: "Only jpg, png, and webp images are accepted.",
            },
          ],
        });
      }

      const buffer = await file.toBuffer();

      const result = await uploadThumbnail({
        courseId: request.params.courseId,
        creatorId: request.creatorId,
        buffer,
        mimeType: file.mimetype,
        extension,
      });

      return reply.send({
        status: "success" as const,
        message: "Thumbnail uploaded successfully",
        data: result,
      });
    },
  );

  // ─── Modules ────────────────────────────────────────────────────────────────

  // POST /admin/courses/:courseId/modules
  app.post(
    "/admin/courses/:courseId/modules",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_MODULES],
        summary: "Create a new module in a course",
        security: BEARER_AUTH,
        params: z.object({ courseId: z.string() }),
        body: createModuleSchema,
        response: {
          201: successResponse(moduleSchema),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const module = await createModule({
        ...request.body,
        courseId: request.params.courseId,
        creatorId: request.creatorId,
      });
      return reply.status(201).send({
        status: "success" as const,
        message: "Module created successfully",
        // biome-ignore lint/style/noNonNullAssertion: createModule throws before returning undefined
        data: module!,
      });
    },
  );

  // PATCH /admin/modules/reorder — must be before /:moduleId to avoid conflict
  app.patch(
    "/admin/modules/reorder",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_MODULES],
        summary: "Reorder modules within a course",
        security: BEARER_AUTH,
        body: reorderModulesSchema,
        response: {
          200: successResponse(
            z.array(z.object({ id: z.string(), position: z.number() })),
          ),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
        },
      },
    },
    async (request, reply) => {
      const result = await reorderModules({
        modules: request.body.modules,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Modules reordered successfully",
        data: result,
      });
    },
  );

  // PATCH /admin/modules/:moduleId
  app.patch(
    "/admin/modules/:moduleId",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_MODULES],
        summary: "Update a module",
        security: BEARER_AUTH,
        params: z.object({ moduleId: z.string() }),
        body: updateModuleSchema,
        response: {
          200: successResponse(moduleSchema),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const module = await updateModule({
        moduleId: request.params.moduleId,
        creatorId: request.creatorId,
        data: request.body,
      });
      return reply.send({
        status: "success" as const,
        message: "Module updated successfully",
        // biome-ignore lint/style/noNonNullAssertion: updateModule throws before returning undefined
        data: module!,
      });
    },
  );

  // DELETE /admin/modules/:moduleId
  app.delete(
    "/admin/modules/:moduleId",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_MODULES],
        summary: "Delete a module (cascades to lessons)",
        security: BEARER_AUTH,
        params: z.object({ moduleId: z.string() }),
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      await deleteModule({
        moduleId: request.params.moduleId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Module deleted successfully",
        data: { message: "Module has been deleted" },
      });
    },
  );

  // ─── Lessons ────────────────────────────────────────────────────────────────

  // PATCH /admin/lessons/reorder — must be before /:lessonId to avoid conflict
  app.patch(
    "/admin/lessons/reorder",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_LESSONS],
        summary: "Reorder lessons within a module",
        security: BEARER_AUTH,
        body: reorderLessonsSchema,
        response: {
          200: successResponse(
            z.array(z.object({ id: z.string(), position: z.number() })),
          ),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
        },
      },
    },
    async (request, reply) => {
      const result = await reorderLessons({
        lessons: request.body.lessons,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Lessons reordered successfully",
        data: result,
      });
    },
  );

  // POST /admin/modules/:moduleId/lessons
  app.post(
    "/admin/modules/:moduleId/lessons",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_LESSONS],
        summary: "Create a new lesson in a module",
        security: BEARER_AUTH,
        params: z.object({ moduleId: z.string() }),
        body: createLessonSchema,
        response: {
          201: successResponse(lessonSchema),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const lesson = await createLesson({
        ...request.body,
        moduleId: request.params.moduleId,
        creatorId: request.creatorId,
      });
      return reply.status(201).send({
        status: "success" as const,
        message: "Lesson created successfully",
        // biome-ignore lint/style/noNonNullAssertion: createLesson throws before returning undefined
        data: lesson!,
      });
    },
  );

  // PATCH /admin/lessons/:lessonId
  app.patch(
    "/admin/lessons/:lessonId",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_LESSONS],
        summary: "Update a lesson",
        security: BEARER_AUTH,
        params: z.object({ lessonId: z.string() }),
        body: updateLessonSchema,
        response: {
          200: successResponse(lessonSchema),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const lesson = await updateLesson({
        lessonId: request.params.lessonId,
        creatorId: request.creatorId,
        data: request.body,
      });
      return reply.send({
        status: "success" as const,
        message: "Lesson updated successfully",
        // biome-ignore lint/style/noNonNullAssertion: updateLesson throws before returning undefined
        data: lesson!,
      });
    },
  );

  // DELETE /admin/lessons/:lessonId
  app.delete(
    "/admin/lessons/:lessonId",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_LESSONS],
        summary: "Delete a lesson",
        security: BEARER_AUTH,
        params: z.object({ lessonId: z.string() }),
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      await deleteLesson({
        lessonId: request.params.lessonId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Lesson deleted successfully",
        data: { message: "Lesson has been deleted" },
      });
    },
  );

  // POST /admin/lessons/:lessonId/video
  app.post(
    "/admin/lessons/:lessonId/video",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_LESSONS],
        summary: "Create a Bunny Stream video upload session for a lesson",
        security: BEARER_AUTH,
        params: z.object({ lessonId: z.string() }),
        response: {
          200: successResponse(
            z.object({
              videoId: z.string(),
              uploadUrl: z.string(),
              authSignature: z.string(),
              authExpire: z.number(),
              libraryId: z.string(),
            }),
          ),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const credentials = await createVideoUpload({
        lessonId: request.params.lessonId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Video upload session created",
        data: credentials,
      });
    },
  );

  // DELETE /admin/lessons/:lessonId/video
  app.delete(
    "/admin/lessons/:lessonId/video",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_LESSONS],
        summary: "Delete the video associated with a lesson",
        security: BEARER_AUTH,
        params: z.object({ lessonId: z.string() }),
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      await deleteLessonVideo({
        lessonId: request.params.lessonId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Video deleted successfully",
        data: { message: "Video has been deleted" },
      });
    },
  );

  // ─── Invite Links ────────────────────────────────────────────────────────────

  const inviteLinkSchema = z.object({
    id: z.string(),
    token: z.string(),
    courseId: z.string(),
    expiresAt: z.date().or(z.string()).nullable(),
    isActive: z.boolean(),
    createdAt: z.date().or(z.string()),
  });

  const pendingEnrollmentSchema = z.object({
    id: z.string(),
    userId: z.string(),
    studentName: z.string(),
    studentEmail: z.string(),
    courseId: z.string(),
    courseTitle: z.string(),
    status: z.string(),
    enrolledAt: z.date().or(z.string()),
  });

  // POST /admin/courses/:courseId/invite-links
  app.post(
    "/admin/courses/:courseId/invite-links",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Generate an invite link for a course",
        security: BEARER_AUTH,
        params: z.object({ courseId: z.string() }),
        body: z.object({
          expiresAt: z.string().datetime().optional(),
        }),
        response: {
          201: successResponse(inviteLinkSchema),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const link = await createInviteLink({
        courseId: request.params.courseId,
        creatorId: request.creatorId,
        ...(request.body.expiresAt
          ? { expiresAt: new Date(request.body.expiresAt) }
          : {}),
      });
      return reply.status(201).send({
        status: "success" as const,
        message: "Invite link created successfully",
        data: link,
      });
    },
  );

  // GET /admin/courses/:courseId/invite-links
  app.get(
    "/admin/courses/:courseId/invite-links",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "List all invite links for a course",
        security: BEARER_AUTH,
        params: z.object({ courseId: z.string() }),
        response: {
          200: successResponse(z.array(inviteLinkSchema)),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const links = await listInviteLinks({
        courseId: request.params.courseId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Invite links retrieved successfully",
        data: links,
      });
    },
  );

  // DELETE /admin/invite-links/:token
  app.delete(
    "/admin/invite-links/:token",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Revoke an invite link",
        security: BEARER_AUTH,
        params: z.object({ token: z.string() }),
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      await revokeInviteLink({
        token: request.params.token,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Invite link revoked successfully",
        data: { message: "Invite link has been revoked" },
      });
    },
  );

  // GET /admin/enrollments/pending
  app.get(
    "/admin/enrollments/pending",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary:
          "List all pending enrollments for courses owned by this creator",
        security: BEARER_AUTH,
        response: {
          200: successResponse(z.array(pendingEnrollmentSchema)),
          401: RESPONSE_401,
          403: RESPONSE_403,
        },
      },
    },
    async (request, reply) => {
      const pending = await listPendingEnrollments({
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Pending enrollments retrieved successfully",
        data: pending,
      });
    },
  );

  // POST /admin/enrollments/:enrollmentId/activate
  app.post(
    "/admin/enrollments/:enrollmentId/activate",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Activate a pending enrollment",
        security: BEARER_AUTH,
        params: z.object({ enrollmentId: z.string() }),
        response: {
          200: successResponse(
            z.object({
              enrollmentId: z.string(),
              userId: z.string(),
              courseId: z.string(),
              status: z.string(),
            }),
          ),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const result = await activateEnrollment({
        enrollmentId: request.params.enrollmentId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Enrollment activated successfully",
        data: result,
      });
    },
  );

  // POST /admin/enrollments/:enrollmentId/revoke
  app.post(
    "/admin/enrollments/:enrollmentId/revoke",
    {
      onRequest: [app.requireCreator],
      schema: {
        tags: [SWAGGER_TAGS.ADMIN_COURSES],
        summary: "Revoke an enrollment (active or pending)",
        security: BEARER_AUTH,
        params: z.object({ enrollmentId: z.string() }),
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      await revokeEnrollment({
        enrollmentId: request.params.enrollmentId,
        creatorId: request.creatorId,
      });
      return reply.send({
        status: "success" as const,
        message: "Enrollment revoked successfully",
        data: { message: "Enrollment has been revoked" },
      });
    },
  );
};

export { adminRoutes };
