import { FROM_EMAIL, resend } from "./client";

const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const { error } = await resend.emails.send({
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

  if (error) {
    throw new Error(`Resend failed to send welcome email: ${error.message}`);
  }
};

const sendPasswordResetEmail = async (
  to: string,
  name: string,
  token: string,
): Promise<void> => {
  const webUrl = process.env.WEB_URL ?? "http://localhost:3000";
  const resetUrl = `${webUrl}/en/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
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
            Clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.
          </p>
          <a
            href="${resetUrl}"
            style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #984207; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;"
          >
            Redefinir minha senha
          </a>
          <p style="margin-top: 24px; font-size: 14px; color: #666; line-height: 1.5;">
            Se o botão não funcionar, copie e cole este link no seu navegador:
          </p>
          <p style="font-size: 13px; color: #984207; word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 24px; font-size: 14px; color: #666; line-height: 1.5;">
            Se você não solicitou a redefinição de senha, ignore este e-mail.
            Sua senha continuará a mesma.
          </p>
        </body>
      </html>
    `,
    text: `Olá ${name}! Acesse o link abaixo para redefinir sua senha (expira em 1 hora):\n\n${resetUrl}\n\nSe você não solicitou isto, ignore este e-mail.`,
  });

  if (error) {
    throw new Error(
      `Resend failed to send password reset email: ${error.message}`,
    );
  }
};

export { sendPasswordResetEmail, sendWelcomeEmail };
