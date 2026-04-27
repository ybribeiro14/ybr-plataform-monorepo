import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { authPlugin } from "./plugins/auth";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { studentRoutes } from "./routes/student";
import { RESPONSE_500, successResponse } from "./swagger/responses";
import { SWAGGER_TAGS } from "./swagger/tags";

const buildApp = async () => {
  const isTest = process.env.NODE_ENV === "test";
  const isProduction = process.env.NODE_ENV === "production";

  const app = Fastify({
    logger: isTest
      ? false
      : { level: process.env.NODE_ENV === "production" ? "warn" : "info" },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // CORS
  await app.register(cors, {
    origin: [
      process.env.WEB_URL ?? "http://localhost:3000",
      process.env.ADMIN_URL ?? "http://localhost:3001",
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
    secret: process.env.JWT_SECRET ?? "",
    sign: { expiresIn: "15m" },
  });

  // Multipart (file uploads)
  await app.register(multipart);

  // Swagger — disabled in production to avoid exposing API docs
  if (!isProduction) {
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
          {
            url: "https://api-staging.ybr-platform.com",
            description: "Staging",
          },
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
          {
            name: "health",
            description: "Service health and readiness checks",
          },
          {
            name: "auth",
            description:
              "Authentication — register, login, token refresh, password reset",
          },
          {
            name: "admin/courses",
            description:
              "Course management for creators (requires creator role)",
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
            description:
              "Student-facing data — enrollments, progress, materials",
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
  }

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

  // Global error handler — normalizes all errors to the standard ApiResponse format
  app.setErrorHandler((err, _request, reply) => {
    const error = err as Error & {
      code?: string;
      statusCode?: number;
      validation?: Array<{ message?: string; instancePath?: string }>;
    };

    // Zod / Fastify validation error (400)
    if (error.code === "FST_ERR_VALIDATION") {
      const validationErrors = (error.validation ?? []).map((v) => ({
        code: "VALIDATION_ERROR",
        detail: v.message ?? "Invalid value",
      }));
      return reply.status(400).send({
        status: "error" as const,
        message: error.message,
        errors: validationErrors,
      });
    }

    // JWT errors (401)
    if (
      error.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER" ||
      error.statusCode === 401
    ) {
      return reply.status(401).send({
        status: "error" as const,
        message: "Unauthorized",
        errors: [{ code: "UNAUTHORIZED", detail: error.message }],
      });
    }

    // Custom app errors with statusCode
    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      status: "error" as const,
      message: error.message ?? "Internal server error",
      errors: [
        {
          code: error.code ?? "INTERNAL_ERROR",
          detail: error.message ?? "Unexpected error",
        },
      ],
    });
  });

  await app.register(authPlugin);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(adminRoutes);
  await app.register(studentRoutes);

  return app;
};

export { buildApp };
