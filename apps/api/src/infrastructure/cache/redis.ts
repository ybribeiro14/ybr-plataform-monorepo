import { Redis } from "@upstash/redis";

const redisUrl = process.env["REDIS_URL"];
const redisToken = process.env["REDIS_TOKEN"];

if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is required");
}
if (!redisToken) {
  throw new Error("REDIS_TOKEN environment variable is required");
}

// Usa sempre @upstash/redis (funciona com Upstash em produção e Upstash local em dev)
export const cache = new Redis({ url: redisUrl, token: redisToken });
