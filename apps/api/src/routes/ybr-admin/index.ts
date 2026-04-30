import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  createCreator,
  getCreator,
  listCreators,
  toggleCreatorStatus,
} from "../../functions/ybr-admin";
import {
  errorResponse,
  RESPONSE_401,
  RESPONSE_403,
  RESPONSE_404,
  successResponse,
} from "../../swagger/responses";
import { BEARER_AUTH } from "../../swagger/security";
import { SWAGGER_TAGS } from "../../swagger/tags";

const creatorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  plan: z.string(),
  isActive: z.boolean(),
  activeCourses: z.number(),
  activeStudents: z.number(),
  createdAt: z.date().or(z.string()),
});

const creatorDetailSchema = creatorSchema
  .extend({
    bio: z.string().nullable(),
    website: z.string().nullable(),
  })
  .omit({ isActive: true });

const ybrAdminRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /ybr-admin/creators
  app.get(
    "/ybr-admin/creators",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: [SWAGGER_TAGS.YBR_ADMIN],
        summary: "List all creators on the platform",
        security: BEARER_AUTH,
        response: {
          200: successResponse(z.array(creatorSchema)),
          401: RESPONSE_401,
          403: RESPONSE_403,
        },
      },
    },
    async (request, reply) => {
      const creators = await listCreators();
      return reply.send({
        status: "success" as const,
        message: "Creators retrieved successfully",
        data: creators,
      });
    },
  );

  // GET /ybr-admin/creators/:creatorId
  app.get(
    "/ybr-admin/creators/:creatorId",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: [SWAGGER_TAGS.YBR_ADMIN],
        summary: "Get a creator with stats",
        security: BEARER_AUTH,
        params: z.object({ creatorId: z.string() }),
        response: {
          200: successResponse(creatorDetailSchema),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const creator = await getCreator(request.params.creatorId);
      return reply.send({
        status: "success" as const,
        message: "Creator retrieved successfully",
        data: creator,
      });
    },
  );

  // POST /ybr-admin/creators
  app.post(
    "/ybr-admin/creators",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: [SWAGGER_TAGS.YBR_ADMIN],
        summary: "Create a new creator account (manual onboarding)",
        security: BEARER_AUTH,
        body: z.object({
          name: z.string().min(2).max(255),
          email: z.string().email(),
          plan: z
            .enum(["starter", "growth", "pro", "agency"])
            .default("starter"),
        }),
        response: {
          201: successResponse(
            z.object({
              id: z.string(),
              userId: z.string(),
              name: z.string(),
              email: z.string(),
              plan: z.string(),
              createdAt: z.date().or(z.string()),
            }),
          ),
          401: RESPONSE_401,
          403: RESPONSE_403,
          409: errorResponse(),
        },
      },
    },
    async (request, reply) => {
      const creator = await createCreator(request.body);
      return reply.status(201).send({
        status: "success" as const,
        message: "Creator account created successfully",
        data: creator,
      });
    },
  );

  // PATCH /ybr-admin/creators/:creatorId/status — activate or suspend creator
  app.patch(
    "/ybr-admin/creators/:creatorId/status",
    {
      onRequest: [app.requireAdmin],
      schema: {
        tags: [SWAGGER_TAGS.YBR_ADMIN],
        summary: "Activate or suspend a creator account",
        security: BEARER_AUTH,
        params: z.object({ creatorId: z.string() }),
        body: z.object({
          isActive: z.boolean(),
        }),
        response: {
          200: successResponse(
            z.object({
              id: z.string(),
              userId: z.string(),
              name: z.string(),
              email: z.string(),
              isActive: z.boolean(),
            }),
          ),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const result = await toggleCreatorStatus({
        creatorId: request.params.creatorId,
        isActive: request.body.isActive,
      });
      return reply.send({
        status: "success" as const,
        message: result.isActive ? "Creator activated" : "Creator suspended",
        data: result,
      });
    },
  );
};

export { ybrAdminRoutes };
