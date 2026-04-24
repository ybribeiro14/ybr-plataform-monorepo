import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

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

  // Swagger (apenas em dev)
  if (process.env["NODE_ENV"] !== "production") {
    await app.register(swagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "YBR Platform API",
          description: "REST API for the YBR online learning platform",
          version: "1.0.0",
        },
      },
    });
    await app.register(swaggerUi, {
      routePrefix: "/docs",
    });
  }

  // Health check
  app.get("/health", async () => ({
    status: "success",
    message: "API is running",
    data: { timestamp: new Date().toISOString() },
  }));

  return app;
};

export { buildApp };
