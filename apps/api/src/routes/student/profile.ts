import type { MultipartFile } from '@fastify/multipart'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  deleteStudentAvatar,
  getStudentProfile,
  updateStudentProfile,
  uploadStudentAvatar,
} from '../../functions/student'
import { RESPONSE_400, RESPONSE_401, RESPONSE_404, successResponse } from '../../swagger/responses'
import { BEARER_AUTH } from '../../swagger/security'
import { SWAGGER_TAGS } from '../../swagger/tags'

interface JWTPayload {
  sub: string
  role: string
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const profileSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  phone: z.string().nullable(),
  cpf: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.enum(['female', 'male', 'nonbinary', 'prefer_not_to_say']).nullable(),
  bio: z.string().nullable(),
  country: z.string().nullable(),
  zipCode: z.string().nullable(),
  street: z.string().nullable(),
  streetNumber: z.string().nullable(),
  complement: z.string().nullable(),
  neighborhood: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  instagramHandle: z.string().nullable(),
  isProfileComplete: z.boolean(),
})

const profileRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  // GET /student/profile
  app.get(
    '/student/profile',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: 'Get student profile',
        description:
          'Returns the authenticated student profile with all personal and address data.',
        security: BEARER_AUTH,
        response: {
          200: successResponse(profileSchema),
          401: RESPONSE_401,
          404: RESPONSE_404,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload
      const profile = await getStudentProfile(userId)
      return reply.send({
        status: 'success',
        message: 'Profile retrieved',
        data: profile,
      })
    }
  )

  // PATCH /student/profile
  app.patch(
    '/student/profile',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: 'Update student profile',
        description:
          'Updates personal data, address and social links. ' +
          'isProfileComplete becomes true when phone is filled.',
        security: BEARER_AUTH,
        body: z.object({
          name: z.string().min(1).max(255).optional(),
          phone: z.string().max(30).optional(),
          cpf: z.string().max(14).optional(),
          birthDate: z.string().optional(),
          gender: z.enum(['female', 'male', 'nonbinary', 'prefer_not_to_say']).optional(),
          bio: z.string().max(500).optional(),
          country: z.string().length(2).optional(),
          zipCode: z.string().max(10).optional(),
          street: z.string().max(255).optional(),
          streetNumber: z.string().max(20).optional(),
          complement: z.string().max(100).optional(),
          neighborhood: z.string().max(100).optional(),
          city: z.string().max(100).optional(),
          state: z.string().max(50).optional(),
          linkedinUrl: z.string().url().max(500).optional().or(z.literal('')),
          instagramHandle: z.string().max(100).optional(),
        }),
        response: {
          200: successResponse(profileSchema),
          400: RESPONSE_400,
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload
      await updateStudentProfile({ userId, ...request.body })
      const updated = await getStudentProfile(userId)
      return reply.send({
        status: 'success',
        message: 'Perfil atualizado com sucesso',
        data: updated,
      })
    }
  )

  // POST /student/profile/avatar
  app.post(
    '/student/profile/avatar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: 'Upload profile avatar',
        description:
          'Accepts a multipart image (JPEG, PNG, WebP or GIF). ' +
          'The image is resized to 400×400 and converted to WebP before uploading to R2.',
        security: BEARER_AUTH,
        consumes: ['multipart/form-data'],
        response: {
          200: successResponse(z.object({ avatarUrl: z.string() })),
          400: RESPONSE_400,
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload

      let file: MultipartFile | undefined
      try {
        file = await request.file({ limits: { fileSize: MAX_AVATAR_BYTES } })
      } catch {
        return reply.code(400).send({
          status: 'error',
          message: 'Arquivo inválido ou muito grande (máx. 5 MB)',
          errors: [{ code: 'INVALID_FILE', detail: 'File exceeds 5 MB limit' }],
        })
      }

      if (!file) {
        return reply.code(400).send({
          status: 'error',
          message: 'Nenhum arquivo enviado',
          errors: [{ code: 'NO_FILE', detail: 'No file was uploaded' }],
        })
      }

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return reply.code(400).send({
          status: 'error',
          message: 'Formato de imagem não suportado. Use JPEG, PNG, WebP ou GIF.',
          errors: [{ code: 'INVALID_MIME_TYPE', detail: `Received: ${file.mimetype}` }],
        })
      }

      const buffer = await file.toBuffer()
      const avatarUrl = await uploadStudentAvatar({
        userId,
        imageBuffer: buffer,
      })

      return reply.send({
        status: 'success',
        message: 'Avatar atualizado',
        data: { avatarUrl },
      })
    }
  )

  // DELETE /student/profile/avatar
  app.delete(
    '/student/profile/avatar',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.STUDENT],
        summary: 'Remove profile avatar',
        description: 'Deletes the avatar from R2 and clears avatarUrl.',
        security: BEARER_AUTH,
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = request.user as JWTPayload
      await deleteStudentAvatar(userId)
      return reply.send({
        status: 'success',
        message: 'Avatar removido',
        data: { message: 'Avatar removed' },
      })
    }
  )
}

export { profileRoutes }
