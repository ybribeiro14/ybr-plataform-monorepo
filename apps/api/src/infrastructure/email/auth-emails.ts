import { FROM_EMAIL, resend } from './client'

const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  if (!resend) {
    // biome-ignore lint/suspicious/noConsole: intentional dev-mode logging
    console.log(`[Email DEV] would send welcome email to: ${to} (${name})`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Welcome to YBR Platform!',
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Welcome, ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Your account has been created successfully. You can now log in and start exploring our courses.
          </p>
          <a
            href="${process.env.WEB_URL ?? 'http://localhost:3000'}/login"
            style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;"
          >
            Go to Platform
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #888;">
            If you did not create this account, please ignore this email.
          </p>
        </body>
      </html>
    `,
  })
}

const sendPasswordResetEmail = async (to: string, name: string, token: string): Promise<void> => {
  if (!resend) {
    // biome-ignore lint/suspicious/noConsole: intentional dev-mode logging
    console.log(`[Email DEV] would send password reset email to: ${to} (${name}) — token: ${token}`)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your YBR Platform password',
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Password Reset</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Hi ${name}, we received a request to reset your password.
            Use the code below to proceed. It expires in 1 hour.
          </p>
          <div style="margin: 24px 0; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; font-family: monospace;">${token}</span>
          </div>
          <p style="font-size: 14px; color: #666; line-height: 1.5;">
            If you did not request a password reset, please ignore this email.
            Your password will remain unchanged.
          </p>
        </body>
      </html>
    `,
  })
}

export { sendPasswordResetEmail, sendWelcomeEmail }
