import { beforeAll } from "vitest";

// Set all required environment variables before any module is imported
beforeAll(() => {
  process.env["NODE_ENV"] = "test";

  // Auth
  process.env["JWT_SECRET"] = "test_jwt_secret_must_be_at_least_32_chars_!";
  process.env["JWT_REFRESH_SECRET"] = "test_refresh_secret_at_least_32_chars_!";

  // Database (mocked in tests — real DB not needed)
  process.env["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test_db";

  // Redis (mocked in tests that need it)
  process.env["REDIS_URL"] = "https://fake-redis.upstash.io";
  process.env["REDIS_TOKEN"] = "fake-redis-token-for-tests";

  // Email (mocked in tests that need it)
  process.env["RESEND_API_KEY"] = "re_test_fake_api_key";
  process.env["RESEND_FROM_EMAIL"] = "test@ybr-platform.com";

  // Stripe (mocked in tests that need it)
  process.env["STRIPE_SECRET_KEY"] = "sk_test_fake_key_for_unit_tests";
  process.env["STRIPE_WEBHOOK_SECRET"] = "whsec_test_fake_webhook_secret";

  // App URLs
  process.env["WEB_URL"] = "http://localhost:3000";
  process.env["ADMIN_URL"] = "http://localhost:3001";
});
