import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { upsertLessonProgress } from "../../functions/student";
import {
  errorResponse,
  RESPONSE_401,
  RESPONSE_403,
  RESPONSE_404,
  successResponse,
} from "../../swagger/responses";
import { BEARER_AUTH } from "../../swagger/security";
import { SWAGGER_TAGS } from "../../swagger/tags";

interface JWTPayload {
  sub: string;
  role: string;
}

/**
 * Decodes the JWT payload without verification to extract the `sub` claim.
 * Used only for rate-limit key generation — the JWT is fully verified later in `authenticate`.
 */
const decodeJwtSub = (req: FastifyRequest): string => {
  try {
    const token = (req.headers.authorization ?? "").split(" ")[1] ?? "";
    const [, payloadPart] = token.split(".");
    const decoded = JSON.parse(
      Buffer.from(payloadPart ?? "", "base64url").toString("utf8"),
    ) as {
      sub?: string;
    };
    return decoded.sub ?? req.ip;
  } catch {
    return req.ip;
  }
};

const progressRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // POST /student/lessons/:lessonId/progress
  app.post(
    "/student/lessons/:lessonId/progress",
    {
      onRequest: [app.authenticate],
      config: {
        rateLimit: {
          // Effectively disabled in test to avoid flaky test behaviour from sequential requests
          max: process.env.NODE_ENV === "test" ? 10000 : 1,
          timeWindow: "5 seconds",
          keyGenerator: (req: FastifyRequest) => {
            const params = req.params as { lessonId?: string };
            return `progress:${decodeJwtSub(req)}:${params.lessonId ?? ""}`;
          },
        },
      },
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: "Update lesson watch progress",
        description:
          "Upserts the watch progress for a lesson. " +
          "Automatically marks the lesson as completed when watchedSeconds reaches 90% of the lesson duration.",
        security: BEARER_AUTH,
        params: z.object({
          lessonId: z.string().uuid(),
        }),
        body: z.object({
          watchedSeconds: z.number().int().min(0),
        }),
        response: {
          200: successResponse(
            z.object({
              watchedSeconds: z.number(),
              completed: z.boolean(),
              completedAt: z.string().nullable(),
            }),
          ),
          400: errorResponse(),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload;
      const { lessonId } = request.params;
      const { watchedSeconds } = request.body;

      const data = await upsertLessonProgress({
        lessonId,
        userId,
        watchedSeconds,
      });

      return reply.send({
        status: "success" as const,
        message: "Progress updated successfully",
        data,
      });
    },
  );
};

export { progressRoutes };
