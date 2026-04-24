import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";

/**
 * Builds and readies a Fastify app instance for use in tests.
 * Uses Fastify's inject() API — no real HTTP server is started.
 */
const buildTestApp = async (): Promise<FastifyInstance> => {
  const app = await buildApp();
  await app.ready();
  return app;
};

export { buildTestApp };
