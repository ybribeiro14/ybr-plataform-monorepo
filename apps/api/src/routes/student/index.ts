import type { FastifyInstance } from "fastify";
import { progressRoutes } from "./progress";
import { streamRoutes } from "./stream";

const studentRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(streamRoutes);
  await fastify.register(progressRoutes);
};

export { studentRoutes };
