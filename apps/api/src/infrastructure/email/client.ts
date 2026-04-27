import { Resend } from 'resend'

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@ybr-platform.com'

const createResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // biome-ignore lint/suspicious/noConsole: intentional dev-mode warning
    console.warn('[Email] RESEND_API_KEY not set — emails will be logged only (dev mode)')
    return null
  }
  return new Resend(apiKey)
}

export const resend = createResendClient()
