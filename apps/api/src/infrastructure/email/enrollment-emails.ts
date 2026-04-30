import { FROM_EMAIL, resend } from "./client";

const sendCourseAccessEmail = async (
  to: string,
  name: string,
  courseTitle: string,
): Promise<void> => {
  const platformUrl = process.env.WEB_URL ?? "http://localhost:3000";

  if (!resend) {
    // biome-ignore lint/suspicious/noConsole: intentional dev-mode logging
    console.log(
      `[Email DEV] would send course access email to: ${to} (${name}) — course: ${courseTitle}`,
    );
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Seu acesso ao curso "${courseTitle}" foi liberado!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Parabéns, ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            Seu acesso ao curso <strong>${courseTitle}</strong> foi ativado. Você já pode começar a estudar agora!
          </p>
          <a
            href="${platformUrl}/meus-cursos"
            style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;"
          >
            Acessar meus cursos
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #888;">
            Se você não esperava este email, entre em contato com o criador do curso.
          </p>
        </body>
      </html>
    `,
    text: `Parabéns, ${name}! Seu acesso ao curso "${courseTitle}" foi ativado. Acesse: ${platformUrl}/meus-cursos`,
  });
};

export { sendCourseAccessEmail };
