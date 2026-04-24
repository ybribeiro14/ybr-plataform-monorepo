import { buildApp } from "./app";

const start = async () => {
  const app = await buildApp();

  const port = Number(process.env["PORT"] ?? 3002);
  const host = process.env["HOST"] ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
    console.info(`🚀 API running on http://${host}:${port}`);
    console.info(`📖 Docs available at http://${host}:${port}/docs`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
