import { creators, db } from "@ybr/database";
import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

interface JWTPayload {
  sub: string;
  role: "student" | "creator" | "admin";
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    requireCreator: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    requireAdmin: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
  interface FastifyRequest {
    creatorId: string;
  }
}

const authPlugin = fp(async (app: FastifyInstance) => {
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, _reply: FastifyReply) => {
      await request.jwtVerify();
    },
  );

  app.decorate(
    "requireCreator",
    async (request: FastifyRequest, _reply: FastifyReply) => {
      await request.jwtVerify();

      const payload = request.user as JWTPayload;

      if (payload.role !== "creator" && payload.role !== "admin") {
        const error = new Error("Insufficient permissions");
        (error as Error & { statusCode: number; code: string }).statusCode =
          403;
        (error as Error & { statusCode: number; code: string }).code =
          "INSUFFICIENT_PERMISSIONS";
        throw error;
      }

      const creator = await db.query.creators.findFirst({
        where: eq(creators.userId, payload.sub),
        columns: { id: true },
      });

      if (!creator) {
        const error = new Error("Creator profile not found");
        (error as Error & { statusCode: number; code: string }).statusCode =
          403;
        (error as Error & { statusCode: number; code: string }).code =
          "CREATOR_NOT_FOUND";
        throw error;
      }

      request.creatorId = creator.id;
    },
  );

  app.decorate(
    "requireAdmin",
    async (request: FastifyRequest, _reply: FastifyReply) => {
      await request.jwtVerify();

      const payload = request.user as JWTPayload;

      if (payload.role !== "admin") {
        const error = new Error("Admin access required");
        (error as Error & { statusCode: number; code: string }).statusCode =
          403;
        (error as Error & { statusCode: number; code: string }).code =
          "INSUFFICIENT_PERMISSIONS";
        throw error;
      }
    },
  );
});

export { authPlugin };
export type { JWTPayload };
