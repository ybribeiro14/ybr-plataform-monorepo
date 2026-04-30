import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { loginOrRegisterWithGoogle } from "../../functions/auth/google-auth";
import { SWAGGER_TAGS } from "../../swagger/tags";

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Extends Fastify instance with googleOAuth2 — only present if plugin registered
declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2?: {
      getAccessTokenFromAuthorizationCodeFlow(
        request: FastifyRequest,
        reply: FastifyReply,
      ): Promise<{ token: { access_token: string } }>;
    };
  }
}

const googleAuthRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /auth/google — initiates OAuth redirect (handled by @fastify/oauth2 startRedirectPath)
  // The plugin auto-registers this route, so we just document it in Swagger
  app.get(
    "/auth/google/start",
    {
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Initiate Google OAuth2 login flow",
        description:
          "Redirects the browser to Google consent screen. The actual redirect is handled by the /auth/google path registered by @fastify/oauth2.",
        response: {
          302: z.null().describe("Redirect to Google"),
        },
      },
    },
    async (_request, reply) => {
      // Redirect to the actual OAuth start path
      return reply.redirect("/auth/google");
    },
  );

  // GET /auth/google/callback — handles Google callback and returns tokens
  app.get(
    "/auth/google/callback",
    {
      schema: {
        tags: [SWAGGER_TAGS.AUTH],
        summary: "Google OAuth2 callback",
        description:
          "Called by Google after user grants permission. Exchanges code for tokens, creates or links the user account, and redirects to the frontend with JWT tokens in query params.",
        querystring: z.object({
          code: z.string().optional(),
          error: z.string().optional(),
          state: z.string().optional(),
        }),
        response: {
          302: z.null().describe("Redirect to frontend with tokens"),
        },
      },
    },
    async (request, reply) => {
      const webUrl = process.env.WEB_URL ?? "http://localhost:3000";

      // If Google OAuth plugin is not configured, return error
      if (!app.googleOAuth2) {
        return reply.redirect(`${webUrl}/login?error=google_not_configured`);
      }

      let accessToken: string;
      try {
        const tokenResponse =
          await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
            request,
            reply,
          );
        accessToken = tokenResponse.token.access_token;
      } catch {
        return reply.redirect(`${webUrl}/login?error=google_auth_failed`);
      }

      // Fetch user info from Google
      let googleUser: GoogleUserInfo;
      try {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch Google user info");
        googleUser = (await res.json()) as GoogleUserInfo;
      } catch {
        return reply.redirect(`${webUrl}/login?error=google_userinfo_failed`);
      }

      // Create or find user
      let tokens: {
        accessToken: string;
        refreshToken: string;
        user: { role: string };
      };
      try {
        tokens = await loginOrRegisterWithGoogle(googleUser, app);
      } catch {
        return reply.redirect(`${webUrl}/login?error=google_login_failed`);
      }

      // Redirect to frontend callback handler with tokens in query string
      const redirectUrl = new URL(`${webUrl}/auth/google/callback`);
      redirectUrl.searchParams.set("access_token", tokens.accessToken);
      redirectUrl.searchParams.set("refresh_token", tokens.refreshToken);

      return reply.redirect(redirectUrl.toString());
    },
  );
};

export { googleAuthRoutes };
