import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getLessonAttachments } from '../../functions/student'
import { RESPONSE_401, RESPONSE_403, RESPONSE_404, successResponse } from '../../swagger/responses'
import { BEARER_AUTH } from '../../swagger/security'
import { SWAGGER_TAGS } from '../../swagger/tags'

interface JWTPayload {
  sub: string
  role: string
}

const attachmentsRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // GET /student/lessons/:lessonId/attachments
  app.get(
    '/student/lessons/:lessonId/attachments',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: 'List attachments for a lesson',
        description:
          'Returns all downloadable attachments (PDFs, docs, links) for a lesson. ' +
          'Requires an active enrollment in the corresponding course.',
        security: BEARER_AUTH,
        params: z.object({
          lessonId: z.string().uuid(),
        }),
        response: {
          200: successResponse(
            z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                fileUrl: z.string(),
                fileType: z.string(),
                fileSizeBytes: z.number().int().nullable(),
              })
            )
          ),
          401: RESPONSE_401,
          403: RESPONSE_403,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload
      const { lessonId } = request.params

      const data = await getLessonAttachments({ lessonId, userId })

      return reply.send({
        status: 'success' as const,
        message: 'Attachments retrieved successfully',
        data,
      })
    }
  )
}

export { attachmentsRoutes }
