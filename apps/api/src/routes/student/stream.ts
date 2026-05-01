import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getLessonStream, getStudentProfile } from '../../functions/student'
import { RESPONSE_401, RESPONSE_403, RESPONSE_404, successResponse } from '../../swagger/responses'
import { BEARER_AUTH } from '../../swagger/security'
import { SWAGGER_TAGS } from '../../swagger/tags'

interface JWTPayload {
  sub: string
  role: string
}

const streamRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // GET /student/lessons/:lessonId/stream
  app.get(
    '/student/lessons/:lessonId/stream',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: 'Get the HLS stream URL for a lesson',
        description:
          'Returns the streamable HLS playlist URL for a lesson. ' +
          'Requires the authenticated student to have an active enrollment in the corresponding course.',
        security: BEARER_AUTH,
        params: z.object({
          lessonId: z.string().uuid(),
        }),
        response: {
          200: successResponse(
            z.object({
              lessonId: z.string(),
              title: z.string(),
              streamUrl: z.string(),
              thumbnailUrl: z.string().nullable(),
              durationSeconds: z.number().nullable(),
              progress: z
                .object({
                  watchedSeconds: z.number(),
                  completed: z.boolean(),
                })
                .nullable(),
            })
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

      const profile = await getStudentProfile(userId)
      if (!profile.isProfileComplete) {
        return reply.code(403).send({
          status: 'error' as const,
          message: 'Complete seu perfil para acessar as aulas',
          errors: [
            {
              code: 'PROFILE_INCOMPLETE',
              detail: 'Student profile is not complete',
            },
          ],
        })
      }

      const data = await getLessonStream({ lessonId, userId })

      return reply.send({
        status: 'success' as const,
        message: 'Stream URL retrieved successfully',
        data,
      })
    }
  )
}

export { streamRoutes }
