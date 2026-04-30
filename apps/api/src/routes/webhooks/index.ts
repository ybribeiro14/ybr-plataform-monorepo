import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { processEnrollmentWebhook } from "../../functions/student";
import {
  errorResponse,
  RESPONSE_404,
  successResponse,
} from "../../swagger/responses";
import { SWAGGER_TAGS } from "../../swagger/tags";

const webhookRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // POST /webhooks/enrollment
  app.post(
    "/webhooks/enrollment",
    {
      schema: {
        tags: [SWAGGER_TAGS.WEBHOOKS],
        summary: "Receive enrollment from external payment system",
        description:
          "Creates or activates an enrollment for a user in a course. " +
          "Authenticated via the X-Webhook-Secret header. Idempotent — safe to retry.",
        headers: z.object({
          "x-webhook-secret": z.string(),
        }),
        body: z.object({
          userId: z.string(),
          courseId: z.string(),
          externalRef: z.string().optional(),
        }),
        response: {
          200: successResponse(
            z.object({
              enrollmentId: z.string(),
              userId: z.string(),
              courseId: z.string(),
              status: z.string(),
              enrolledAt: z.string().datetime(),
            }),
          ),
          401: errorResponse(),
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const secret = request.headers["x-webhook-secret"];
      const expectedSecret = process.env.WEBHOOK_ENROLLMENT_SECRET ?? "";

      if (!expectedSecret || secret !== expectedSecret) {
        return reply.status(401).send({
          status: "error" as const,
          message: "Unauthorized",
          errors: [
            {
              code: "INVALID_WEBHOOK_SECRET",
              detail: "Invalid or missing webhook secret",
            },
          ],
        });
      }

      const { userId, courseId, externalRef } = request.body;

      const data = await processEnrollmentWebhook({
        userId,
        courseId,
        ...(externalRef ? { externalRef } : {}),
      });

      return reply.send({
        status: "success" as const,
        message: "Enrollment processed successfully",
        data: {
          ...data,
          enrolledAt: data.enrolledAt.toISOString(),
        },
      });
    },
  );
};

export { webhookRoutes };
