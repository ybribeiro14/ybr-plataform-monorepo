import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getStudentCourse, getStudentProfile } from '../../functions/student'
import { RESPONSE_401, RESPONSE_403, RESPONSE_404, successResponse } from '../../swagger/responses'
import { BEARER_AUTH } from '../../swagger/security'
import { SWAGGER_TAGS } from '../../swagger/tags'

interface JWTPayload {
  sub: string
  role: string
}

const coursesRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // GET /student/courses/:courseId
  app.get(
    '/student/courses/:courseId',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: 'Get course details for enrolled student',
        description:
          'Returns full course structure with modules, lessons and individual lesson progress. ' +
          'Requires an active enrollment in the course.',
        security: BEARER_AUTH,
        params: z.object({
          courseId: z.string().uuid(),
        }),
        response: {
          200: successResponse(
            z.object({
              courseId: z.string(),
              title: z.string(),
              slug: z.string(),
              description: z.string().nullable(),
              thumbnailUrl: z.string().nullable(),
              totalLessons: z.number().int(),
              completedLessons: z.number().int(),
              progressPercent: z.number().int().min(0).max(100),
              modules: z.array(
                z.object({
                  moduleId: z.string(),
                  title: z.string(),
                  position: z.number().int(),
                  lessons: z.array(
                    z.object({
                      lessonId: z.string(),
                      title: z.string(),
                      position: z.number().int(),
                      durationSeconds: z.number().int().nullable(),
                      hasVideo: z.boolean(),
                      progress: z
                        .object({
                          watchedSeconds: z.number().int(),
                          completed: z.boolean(),
                        })
                        .nullable(),
                    })
                  ),
                })
              ),
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
      const { courseId } = request.params

      const profile = await getStudentProfile(userId)
      if (!profile.isProfileComplete) {
        return reply.code(403).send({
          status: 'error' as const,
          message: 'Complete seu perfil para acessar os cursos',
          errors: [
            {
              code: 'PROFILE_INCOMPLETE',
              detail: 'Student profile is not complete',
            },
          ],
        })
      }

      const data = await getStudentCourse({ courseId, userId })

      return reply.send({
        status: 'success' as const,
        message: 'Course details retrieved successfully',
        data,
      })
    }
  )
}

export { coursesRoutes }
