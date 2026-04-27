import { beforeAll } from "vitest";

// Set environment variables at module level so they are available when
// modules like @ybr/database and redis are imported (before beforeAll runs).
process.env["NODE_ENV"] = "test";

// Auth
process.env["JWT_SECRET"] = "test_jwt_secret_must_be_at_least_32_chars_!";
process.env["JWT_REFRESH_SECRET"] = "test_refresh_secret_at_least_32_chars_!";

// Database (mocked in tests — real DB not needed)
process.env["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test_db";

// Redis (mocked in tests that need it)
process.env["REDIS_URL"] = "redis://fake-redis.local:6379";
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

// Cloudflare R2 (mocked in tests that need it)
process.env["R2_ACCOUNT_ID"] = "fake-account-id";
process.env["R2_ACCESS_KEY_ID"] = "fake-access-key";
process.env["R2_SECRET_ACCESS_KEY"] = "fake-secret-key";
process.env["R2_BUCKET_NAME"] = "ybr-platform-test";
process.env["R2_PUBLIC_URL"] = "https://test.r2.dev";

// Bunny Stream (mocked in tests that need it)
process.env["BUNNY_STREAM_API_KEY"] = "fake-bunny-api-key";
process.env["BUNNY_VIDEO_LIBRARY_ID"] = "12345";
process.env["BUNNY_PULL_ZONE_URL"] = "https://test.b-cdn.net";

// Re-apply defaults before each test file to ensure a clean environment
// (some tests may delete or override individual variables).
beforeAll(() => {
  process.env["NODE_ENV"] = "test";
  process.env["JWT_SECRET"] = "test_jwt_secret_must_be_at_least_32_chars_!";
  process.env["JWT_REFRESH_SECRET"] = "test_refresh_secret_at_least_32_chars_!";
  process.env["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test_db";
  process.env["REDIS_URL"] = "redis://fake-redis.local:6379";
  process.env["REDIS_TOKEN"] = "fake-redis-token-for-tests";
  process.env["RESEND_API_KEY"] = "re_test_fake_api_key";
  process.env["RESEND_FROM_EMAIL"] = "test@ybr-platform.com";
  process.env["STRIPE_SECRET_KEY"] = "sk_test_fake_key_for_unit_tests";
  process.env["STRIPE_WEBHOOK_SECRET"] = "whsec_test_fake_webhook_secret";
  process.env["WEB_URL"] = "http://localhost:3000";
  process.env["ADMIN_URL"] = "http://localhost:3001";
  process.env["R2_ACCOUNT_ID"] = "fake-account-id";
  process.env["R2_ACCESS_KEY_ID"] = "fake-access-key";
  process.env["R2_SECRET_ACCESS_KEY"] = "fake-secret-key";
  process.env["R2_BUCKET_NAME"] = "ybr-platform-test";
  process.env["R2_PUBLIC_URL"] = "https://test.r2.dev";
  process.env["BUNNY_STREAM_API_KEY"] = "fake-bunny-api-key";
  process.env["BUNNY_VIDEO_LIBRARY_ID"] = "12345";
  process.env["BUNNY_PULL_ZONE_URL"] = "https://test.b-cdn.net";
});
