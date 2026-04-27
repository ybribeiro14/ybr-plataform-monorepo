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
