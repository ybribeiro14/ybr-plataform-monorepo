import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { getPublicBranding } from '../../functions/admin'
import { successResponse } from '../../swagger/responses'
import { NO_AUTH } from '../../swagger/security'
import { SWAGGER_TAGS } from '../../swagger/tags'

const publicRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // GET /branding — public endpoint to fetch creator brand identity for theming
  app.get(
    '/branding',
    {
      schema: {
        tags: [SWAGGER_TAGS.PUBLIC],
        summary: 'Get creator brand identity for white-label theming',
        description:
          "Returns the platform creator's branding data (colors, logo, name). No authentication required. Used by the student-facing app to apply the creator's visual identity.",
        security: NO_AUTH,
        response: {
          200: successResponse(
            z.object({
              brandName: z.string().nullable(),
              logoUrl: z.string().nullable(),
              primaryColor: z.string(),
              onPrimaryColor: z.string(),
              accentColor: z.string(),
              onAccentColor: z.string(),
              sidebarBgColor: z.string(),
              onSidebarColor: z.string(),
            })
          ),
        },
      },
    },
    async (_request, reply) => {
      const branding = await getPublicBranding()
      return reply.send({
        status: 'success' as const,
        message: 'Branding retrieved successfully',
        data: branding,
      })
    }
  )
}

export { publicRoutes }
