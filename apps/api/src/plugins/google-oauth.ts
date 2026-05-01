import oauth2 from '@fastify/oauth2'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

const googleOAuthPlugin = fp(async (app: FastifyInstance) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3002/auth/google/callback'

  // If credentials not configured, skip (allows app to boot in dev without Google)
  if (!clientId || !clientSecret) {
    app.log.warn(
      '[GoogleOAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google login disabled'
    )
    return
  }

  await app.register(oauth2, {
    name: 'googleOAuth2',
    scope: ['openid', 'email', 'profile'],
    credentials: {
      client: {
        id: clientId,
        secret: clientSecret,
      },
      auth: oauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/auth/google',
    callbackUri: callbackUrl,
  })
})

export { googleOAuthPlugin }
