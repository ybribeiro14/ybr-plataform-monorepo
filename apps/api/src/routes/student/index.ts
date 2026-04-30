import type { FastifyInstance } from "fastify";
import { attachmentsRoutes } from "./attachments";
import { coursesRoutes } from "./courses";
import { enrollmentsRoutes } from "./enrollments";
import { progressRoutes } from "./progress";
import { streamRoutes } from "./stream";

const studentRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(streamRoutes);
  await fastify.register(progressRoutes);
  await fastify.register(enrollmentsRoutes);
  await fastify.register(coursesRoutes);
  await fastify.register(attachmentsRoutes);
};

export { studentRoutes };
