import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { getInviteTokenInfo, registerViaInvite } from "../../functions/admin";
import {
  errorResponse,
  RESPONSE_404,
  successResponse,
} from "../../swagger/responses";
import { NO_AUTH } from "../../swagger/security";
import { SWAGGER_TAGS } from "../../swagger/tags";

const inviteRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /invite/:token — validate token and return course info
  app.get(
    "/invite/:token",
    {
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Validate an invite token and return course metadata",
        security: NO_AUTH,
        params: z.object({ token: z.string() }),
        response: {
          200: successResponse(
            z.object({
              token: z.string(),
              courseId: z.string(),
              courseTitle: z.string(),
              creatorName: z.string(),
              expiresAt: z.date().or(z.string()).nullable(),
            }),
          ),
          404: RESPONSE_404,
          410: errorResponse(),
        },
      },
    },
    async (request, reply) => {
      const info = await getInviteTokenInfo({ token: request.params.token });
      return reply.send({
        status: "success" as const,
        message: "Invite token is valid",
        data: info,
      });
    },
  );

  // POST /invite/:token/register — student registers via invite link
  app.post(
    "/invite/:token/register",
    {
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary:
          "Register a student via an invite link — creates pending enrollment",
        security: NO_AUTH,
        params: z.object({ token: z.string() }),
        body: z.object({
          name: z.string().min(2).max(255),
          email: z.string().email(),
          password: z.string().min(8).max(100),
        }),
        response: {
          201: successResponse(
            z.object({
              userId: z.string(),
              enrollmentId: z.string(),
              courseTitle: z.string(),
              status: z.literal("pending"),
            }),
          ),
          404: RESPONSE_404,
          410: errorResponse(),
          422: errorResponse(),
        },
      },
    },
    async (request, reply) => {
      const result = await registerViaInvite({
        token: request.params.token,
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
      });
      return reply.status(201).send({
        status: "success" as const,
        message:
          "Registration successful. Your enrollment is pending activation.",
        data: result,
      });
    },
  );
};

export { inviteRoutes };
