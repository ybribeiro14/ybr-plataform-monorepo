import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildTestApp } from "./helpers/build-test-app";

describe("GET /health", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns HTTP 200", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
  });

  it('returns status "success" and expected message', async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    const body = response.json<{
      status: string;
      message: string;
      data: { timestamp: string };
    }>();

    expect(body.status).toBe("success");
    expect(body.message).toBe("API is running");
  });

  it("returns a valid ISO 8601 timestamp in data", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    const body = response.json<{ data: { timestamp: string } }>();

    const date = new Date(body.data.timestamp);
    expect(date).toBeInstanceOf(Date);
    expect(Number.isNaN(date.getTime())).toBe(false);
  });

  it("sets Content-Type to application/json", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });
});

describe("Unknown routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns HTTP 404 for an unknown GET route", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/this-does-not-exist",
    });
    expect(response.statusCode).toBe(404);
  });

  it("returns HTTP 404 for an unknown POST route", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/unknown",
      payload: {},
    });
    expect(response.statusCode).toBe(404);
  });
});
