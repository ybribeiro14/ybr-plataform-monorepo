import { FROM_EMAIL, resend } from "./client";

const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  if (!resend) {
    // biome-ignore lint/suspicious/noConsole: intentional dev-mode logging
    console.log(`[Email DEV] would send welcome email to: ${to} (${name})`);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Bem-vindo(a) à YBR Platform!",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Bem-vindo(a), ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Sua conta foi criada com sucesso. Você já pode acessar a plataforma e explorar os cursos disponíveis.
          </p>
          <a
            href="${process.env.WEB_URL ?? "http://localhost:3000"}/login"
            style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;"
          >
            Acessar a plataforma
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #888;">
            Se você não criou esta conta, ignore este e-mail.
          </p>
        </body>
      </html>
    `,
    text: `Bem-vindo(a), ${name}! Sua conta foi criada com sucesso. Acesse: ${process.env.WEB_URL ?? "http://localhost:3000"}/login`,
  });
};

const sendPasswordResetEmail = async (
  to: string,
  name: string,
  token: string,
): Promise<void> => {
  if (!resend) {
    // biome-ignore lint/suspicious/noConsole: intentional dev-mode logging
    console.log(
      `[Email DEV] would send password reset email to: ${to} (${name}) — token: ${token}`,
    );
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Redefinir senha — YBR Platform",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Redefinição de Senha</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Olá ${name}, recebemos uma solicitação para redefinir sua senha.
            Use o código abaixo para continuar. Ele expira em 1 hora.
          </p>
          <div style="margin: 24px 0; padding: 16px; background: #f5f5f5; border-radius: 8px; text-align: center;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; font-family: monospace;">${token}</span>
          </div>
          <p style="font-size: 14px; color: #666; line-height: 1.5;">
            Se você não solicitou a redefinição de senha, ignore este e-mail.
            Sua senha continuará a mesma.
          </p>
        </body>
      </html>
    `,
    text: `Olá ${name}! Seu código de redefinição de senha é: ${token}. Ele expira em 1 hora.`,
  });
};

export { sendPasswordResetEmail, sendWelcomeEmail };
