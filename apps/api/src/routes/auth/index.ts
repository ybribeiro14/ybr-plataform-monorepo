import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@ybr/schemas";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  updatePreferredLocale,
} from "../../functions/auth";
import {
  errorResponse,
  RESPONSE_401,
  RESPONSE_422,
  successResponse,
} from "../../swagger/responses";
import { BEARER_AUTH, NO_AUTH } from "../../swagger/security";
import { SWAGGER_TAGS } from "../../swagger/tags";

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  avatarUrl: z.string().nullable().optional(),
  preferredLocale: z.string(),
  createdAt: z.date().or(z.string()),
});

const authRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  // POST /register
  app.post(
    "/register",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Register a new student account",
        security: NO_AUTH,
        body: registerSchema,
        response: {
          201: successResponse(userSchema),
          400: errorResponse(),
          422: RESPONSE_422,
        },
      },
    },
    async (request, reply) => {
      const user = await registerUser(request.body).catch((err) => {
        if (
          (err as Error & { code?: string }).code === "EMAIL_ALREADY_EXISTS"
        ) {
          reply.status(400).send({
            status: "error" as const,
            message: "Email already in use",
            errors: [
              {
                code: "EMAIL_ALREADY_EXISTS",
                detail: "An account with this email already exists.",
              },
            ],
          });
          return null;
        }
        throw err;
      });

      if (!user) return;

      return reply.status(201).send({
        status: "success" as const,
        message: "User registered successfully",
        data: user,
      });
    },
  );

  // POST /login
  app.post(
    "/login",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Authenticate and receive access + refresh tokens",
        security: NO_AUTH,
        body: loginSchema,
        response: {
          200: successResponse(
            z.object({
              accessToken: z.string(),
              refreshToken: z.string(),
              user: z.object({
                id: z.string(),
                email: z.string(),
                name: z.string(),
                role: z.string(),
              }),
            }),
          ),
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const result = await loginUser(request.body, app).catch((err) => {
        const status = (err as Error & { statusCode?: number }).statusCode;
        if (status === 401) {
          reply.status(401).send({
            status: "error" as const,
            message: "Invalid credentials",
            errors: [
              {
                code: "INVALID_CREDENTIALS",
                detail: "Email or password is incorrect.",
              },
            ],
          });
          return null;
        }
        throw err;
      });

      if (!result) return;

      return reply.send({
        status: "success" as const,
        message: "Login successful",
        data: result,
      });
    },
  );

  // POST /refresh
  app.post(
    "/refresh",
    {
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Exchange refresh token for a new access token",
        security: NO_AUTH,
        body: z.object({ refreshToken: z.string() }),
        response: {
          200: successResponse(z.object({ accessToken: z.string() })),
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const result = await refreshAccessToken(request.body, app).catch(
        (err) => {
          const status = (err as Error & { statusCode?: number }).statusCode;
          if (status === 401) {
            reply.status(401).send({
              status: "error" as const,
              message: "Invalid or expired refresh token",
              errors: [
                {
                  code: "INVALID_REFRESH_TOKEN",
                  detail: "The refresh token is invalid or has expired.",
                },
              ],
            });
            return null;
          }
          throw err;
        },
      );

      if (!result) return;

      return reply.send({
        status: "success" as const,
        message: "Token refreshed successfully",
        data: result,
      });
    },
  );

  // POST /logout
  app.post(
    "/logout",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Revoke refresh token and log out",
        security: BEARER_AUTH,
        response: {
          200: successResponse(z.object({ message: z.string() })),
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const payload = request.user as { sub: string };
      await logoutUser({ userId: payload.sub });
      return reply.send({
        status: "success" as const,
        message: "Logged out successfully",
        data: { message: "Session revoked" },
      });
    },
  );

  // POST /forgot-password
  app.post(
    "/forgot-password",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Request a password reset token via email",
        security: NO_AUTH,
        body: forgotPasswordSchema,
        response: {
          200: successResponse(z.object({ message: z.string() })),
        },
      },
    },
    async (request, reply) => {
      const result = await forgotPassword(request.body);
      return reply.send({
        status: "success" as const,
        message: result.message,
        data: { message: result.message },
      });
    },
  );

  // POST /reset-password
  app.post(
    "/reset-password",
    {
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Reset password using a valid reset token",
        security: NO_AUTH,
        body: resetPasswordSchema,
        response: {
          200: successResponse(z.object({ message: z.string() })),
          400: errorResponse(),
          422: RESPONSE_422,
        },
      },
    },
    async (request, reply) => {
      const result = await resetPassword(request.body).catch((err) => {
        const code = (err as Error & { code?: string }).code;
        if (code === "INVALID_RESET_TOKEN") {
          reply.status(400).send({
            status: "error" as const,
            message: "Invalid or expired reset token",
            errors: [
              {
                code: "INVALID_RESET_TOKEN",
                detail: "The token is invalid or has expired.",
              },
            ],
          });
          return null;
        }
        throw err;
      });

      if (!result) return;

      return reply.send({
        status: "success" as const,
        message: result.message,
        data: { message: result.message },
      });
    },
  );

  // GET /me
  app.get(
    "/me",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Get the currently authenticated user profile",
        security: BEARER_AUTH,
        response: {
          200: successResponse(userSchema),
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const payload = request.user as { sub: string };
      const user = await getCurrentUser({ userId: payload.sub });
      return reply.send({
        status: "success" as const,
        message: "User retrieved successfully",
        data: user,
      });
    },
  );

  // PATCH /me/language
  app.patch(
    "/me/language",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Update the preferred language for the authenticated user",
        security: BEARER_AUTH,
        body: z.object({
          locale: z.enum(["pt-BR", "en"]),
        }),
        response: {
          200: successResponse(z.object({ preferredLocale: z.string() })),
          401: RESPONSE_401,
        },
      },
    },
    async (request, reply) => {
      const payload = request.user as { sub: string };
      const result = await updatePreferredLocale({
        userId: payload.sub,
        locale: request.body.locale,
      });
      return reply.send({
        status: "success" as const,
        message: "Language updated successfully",
        data: result,
      });
    },
  );
};

export { authRoutes };
