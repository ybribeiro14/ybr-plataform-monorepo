import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { getEnrollments } from "../../functions/student";
import { RESPONSE_401, successResponse } from "../../swagger/responses";
import { BEARER_AUTH } from "../../swagger/security";
import { SWAGGER_TAGS } from "../../swagger/tags";

interface JWTPayload {
  sub: string;
  role: string;
}

const enrollmentsRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /student/enrollments
  app.get(
    "/student/enrollments",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: "List enrolled courses with progress",
        description:
          "Returns all active enrollments for the authenticated student, including aggregated progress per course.",
        security: BEARER_AUTH,
        response: {
          200: successResponse(
            z.array(
              z.object({
                enrollmentId: z.string(),
                courseId: z.string(),
                title: z.string(),
                slug: z.string(),
                thumbnailUrl: z.string().nullable(),
                totalLessons: z.number().int(),
                completedLessons: z.number().int(),
                progressPercent: z.number().int().min(0).max(100),
                enrolledAt: z.string().datetime(),
              }),
            ),
          ),
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload;

      const data = await getEnrollments({ userId });

      const serialized = data.map((item) => ({
        ...item,
        enrolledAt: item.enrolledAt.toISOString(),
      }));

      return reply.send({
        status: "success" as const,
        message: "Enrollments retrieved successfully",
        data: serialized,
      });
    },
  );
};

export { enrollmentsRoutes };
