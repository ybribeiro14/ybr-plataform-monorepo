import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { RESPONSE_500, successResponse } from "./swagger/responses";
import { SWAGGER_TAGS } from "./swagger/tags";

const buildApp = async () => {
  const isTest = process.env["NODE_ENV"] === "test";

  const app = Fastify({
    logger: isTest
      ? false
      : { level: process.env["NODE_ENV"] === "production" ? "warn" : "info" },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // CORS
  await app.register(cors, {
    origin: [
      process.env["WEB_URL"] ?? "http://localhost:3000",
      process.env["ADMIN_URL"] ?? "http://localhost:3001",
    ],
    credentials: true,
  });

  // Rate limiting global
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // JWT
  await app.register(jwt, {
    secret: process.env["JWT_SECRET"] ?? "",
    sign: { expiresIn: "15m" },
  });

  // Swagger
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "YBR Platform API",
        description: `REST API for the YBR Platform — a white-label online course platform for Brazilian creators in the US market.\n\n## Authentication\nProtected endpoints require a Bearer JWT token in the Authorization header:\n\`\`\`\nAuthorization: Bearer <access_token>\n\`\`\`\nObtain a token via \`POST /auth/login\`. Access tokens expire in 15 minutes. Use \`POST /auth/refresh\` to renew.\n\n## Standard Response Format\nAll responses follow the shape:\n\`\`\`json\n{ "status": "success" | "error", "message": "...", "data": {}, "errors": [] }\n\`\`\``,
        version: "1.0.0",
        contact: {
          name: "YBR Platform Team",
          email: "dev@ybr-platform.com",
        },
      },
      servers: [
        { url: "http://localhost:3002", description: "Local development" },
        { url: "https://api-staging.ybr-platform.com", description: "Staging" },
        { url: "https://api.ybr-platform.com", description: "Production" },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT access token obtained from POST /auth/login",
          },
        },
      },
      tags: [
        { name: "health", description: "Service health and readiness checks" },
        {
          name: "auth",
          description:
            "Authentication — register, login, token refresh, password reset",
        },
        {
          name: "admin/courses",
          description: "Course management for creators (requires creator role)",
        },
        {
          name: "admin/modules",
          description:
            "Module management within courses (requires creator role)",
        },
        {
          name: "admin/lessons",
          description:
            "Lesson management within modules (requires creator role)",
        },
        {
          name: "student",
          description: "Student-facing data — enrollments, progress, materials",
        },
        {
          name: "public",
          description:
            "Public endpoints — course landing pages, catalog (no auth required)",
        },
        {
          name: "payments",
          description:
            "Stripe checkout, payment intents, and webhook processing",
        },
        { name: "coupons", description: "Coupon validation and management" },
        {
          name: "certificates",
          description: "Certificate generation and public verification",
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      persistAuthorization: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Health check
  app.get(
    "/health",
    {
      schema: {
        tags: [SWAGGER_TAGS.HEALTH],
        summary: "Health check",
        description:
          "Returns API status and current server timestamp. Used by load balancers and monitoring tools.",
        response: {
          200: successResponse(z.object({ timestamp: z.string().datetime() })),
          500: RESPONSE_500,
        },
      },
    },
    async () => ({
      status: "success" as const,
      message: "API is running",
      data: { timestamp: new Date().toISOString() },
    }),
  );

  return app;
};

export { buildApp };
