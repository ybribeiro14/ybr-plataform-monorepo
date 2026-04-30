import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { generateCertificate } from "../../functions/certificates/generate-certificate";
import { verifyCertificate } from "../../functions/certificates/verify-certificate";
import {
  RESPONSE_400,
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

const certificateRoutes = async (app: FastifyInstance) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /student/certificates/generate — generate certificate for completed course
  server.post(
    "/student/certificates/generate",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.CERTIFICATES],
        summary: "Generate certificate for a completed course",
        description:
          "Generates and stores a PDF certificate when the student has completed 100% of the course lessons. Idempotent — calling multiple times returns the existing certificate.",
        security: BEARER_AUTH,
        body: z.object({
          courseId: z.string().uuid("Invalid course ID"),
        }),
        response: {
          201: successResponse(
            z.object({
              certificateId: z.string(),
              verificationCode: z.string(),
              certificateUrl: z.string().nullable(),
              studentName: z.string(),
              courseTitle: z.string(),
              issuedAt: z.string().datetime(),
            }),
          ),
          400: RESPONSE_400,
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload;
      const { courseId } = request.body;

      const cert = await generateCertificate({ courseId, userId });

      return reply.status(201).send({
        status: "success" as const,
        message: "Certificate generated successfully",
        data: cert,
      });
    },
  );

  // GET /certificates/:code/verify — public certificate verification
  server.get(
    "/certificates/:code/verify",
    {
      schema: {
        tags: [SWAGGER_TAGS.CERTIFICATES],
        summary: "Verify a certificate by its verification code",
        description:
          "Public endpoint — verifies the authenticity of a certificate using its unique verification code. No authentication required.",
        params: z.object({
          code: z.string().min(1),
        }),
        response: {
          200: successResponse(
            z.object({
              certificateId: z.string(),
              verificationCode: z.string(),
              studentName: z.string(),
              courseTitle: z.string(),
              creatorName: z.string(),
              issuedAt: z.string().datetime(),
              certificateUrl: z.string().nullable(),
            }),
          ),
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const { code } = request.params;
      const cert = await verifyCertificate(code);

      return reply.status(200).send({
        status: "success" as const,
        message: "Certificate is valid",
        data: cert,
      });
    },
  );
};

export { certificateRoutes };
