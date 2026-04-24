import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

describe("buildApp — environment-specific behavior", () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env["NODE_ENV"];
  });

  afterEach(() => {
    process.env["NODE_ENV"] = originalNodeEnv;
  });

  it('registers Swagger and /docs route when NODE_ENV is not "production"', async () => {
    process.env["NODE_ENV"] = "development";
    const app = await buildApp();
    await app.ready();

    const response = await app.inject({ method: "GET", url: "/docs" });
    // Swagger UI redirects to /docs/ or returns HTML
    expect([200, 301, 302]).toContain(response.statusCode);

    await app.close();
  });

  it('does not register Swagger when NODE_ENV is "production"', async () => {
    process.env["NODE_ENV"] = "production";
    const app = await buildApp();
    await app.ready();

    const response = await app.inject({ method: "GET", url: "/docs" });
    expect(response.statusCode).toBe(404);

    await app.close();
  });

  it("still serves /health in production mode", async () => {
    process.env["NODE_ENV"] = "production";
    const app = await buildApp();
    await app.ready();

    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);

    await app.close();
  });
});

describe("buildApp — CORS and default fallbacks", () => {
  let originalWebUrl: string | undefined;
  let originalAdminUrl: string | undefined;
  let originalJwtSecret: string | undefined;

  beforeEach(() => {
    originalWebUrl = process.env["WEB_URL"];
    originalAdminUrl = process.env["ADMIN_URL"];
    originalJwtSecret = process.env["JWT_SECRET"];
  });

  afterEach(() => {
    process.env["WEB_URL"] = originalWebUrl;
    process.env["ADMIN_URL"] = originalAdminUrl;
    process.env["JWT_SECRET"] = originalJwtSecret;
  });

  it("uses fallback localhost URLs when WEB_URL and ADMIN_URL are not set", async () => {
    delete process.env["WEB_URL"];
    delete process.env["ADMIN_URL"];

    // Should not throw — falls back to localhost defaults
    const app = await buildApp();
    await app.ready();

    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);

    await app.close();
  });
});
