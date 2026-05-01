# Bug History - YBR Platform

## 🔴 Backend Bugs

### [001] GET /admin/courses returns 500 — FST_ERR_RESPONSE_SERIALIZATION

- **Date**: 2026-04-27
- **Category**: API / Response Serialization
- **Severity**: High
- **Description**: `GET /admin/courses` returned 500 with `FST_ERR_RESPONSE_SERIALIZATION` ("Response doesn't match the schema"). The admin courses list page showed the error on screen.
- **Root Cause**: `listCourses` used an explicit `select({...})` that listed individual fields but omitted `creatorId`. The Fastify route's response schema (`courseWithCountsSchema` → extends `courseSchema`) declares `creatorId: z.string()` as required. Fastify's serializer failed because the field was absent from the query result.
- **Solution**: Added `creatorId: courses.creatorId` to the explicit select in `listCourses`.
- **File(s) Affected**: [apps/api/src/functions/admin/courses/list-courses.ts](../../apps/api/src/functions/admin/courses/list-courses.ts)
- **Test**: Load `GET /admin/courses` with a valid creator JWT — should return 200 with course list including `creatorId` per item.

---

### [002] Emails silently not sent — Resend SDK v4 returns `{ data, error }` instead of throwing

- **Date**: 2026-05-01
- **Category**: Email / Infrastructure
- **Severity**: High
- **Description**: Welcome emails on registration and password reset emails were never delivered. No errors appeared in logs or user-facing responses.
- **Root Cause**: Resend SDK v4 changed the API of `emails.send()` — it now returns `{ data, error }` instead of throwing on failure. The code called `await resend.emails.send(...)` without checking the returned `error` object. When Resend rejected the request (e.g., unverified sender domain `noreply@ybr-platform.com`), the error was silently dropped. The `.catch()` handlers in `register-user.ts` and `forgot-password.ts` were never triggered.
- **Root Cause (secondary)**: The old code had a dead `if (!resend)` guard since `client.ts` always throws if `RESEND_API_KEY` is missing — so `resend` was always truthy. This dead branch masked intent and confused debugging.
- **Solution**: Destructure the Resend response and throw if `error` is present. All three email functions now follow: `const { error } = await resend.emails.send(...)` / `if (error) throw new Error(...)`. Removed the dead `if (!resend)` guards.
- **File(s) Affected**:
  - [apps/api/src/infrastructure/email/auth-emails.ts](../../apps/api/src/infrastructure/email/auth-emails.ts)
  - [apps/api/src/infrastructure/email/enrollment-emails.ts](../../apps/api/src/infrastructure/email/enrollment-emails.ts)
- **Test**: Trigger registration or forgot-password — check API server logs for `[Email] Failed to send ...` if domain is unverified, or confirm email arrives in inbox if domain is verified in Resend dashboard.
- **Action required**: Verify domain `ybr-platform.com` in [Resend dashboard](https://resend.com/domains) OR change `RESEND_FROM_EMAIL` to `onboarding@resend.dev` for local testing.
