# Swagger / OpenAPI Documentation Guide

This directory contains shared helpers for annotating Fastify routes with OpenAPI metadata.
All routes in `apps/api/src/routes/` must use these helpers consistently.

---

## 1. When to Annotate

**Every route, no exceptions.** Even simple GET endpoints need tags, a summary, and a response schema.
This keeps the `/docs` UI useful and ensures proper serialization via `fastify-type-provider-zod`.

---

## 2. Required Fields

| Field               | Required                | Notes                                              |
| ------------------- | ----------------------- | -------------------------------------------------- |
| `tags`              | ✅                      | Use `SWAGGER_TAGS.*` constants (never raw strings) |
| `summary`           | ✅                      | One short sentence, sentence case                  |
| `description`       | Optional                | Longer explanation, markdown allowed               |
| `response[200]`     | ✅                      | Always wrap with `successResponse()`               |
| `response[4xx/5xx]` | Recommended             | Use predefined `RESPONSE_*` constants              |
| `security`          | ✅ for protected routes | Use `BEARER_AUTH` from `security.ts`               |

---

## 3. Auth Routes (JWT Protected)

Always add the `security` field on any route that calls `request.jwtVerify()`:

```typescript
import { BEARER_AUTH } from '../swagger/security'

schema: {
  tags: [SWAGGER_TAGS.STUDENT],
  summary: 'Get my enrollments',
  security: BEARER_AUTH,
  response: { 200: successResponse(enrollmentsSchema), 401: RESPONSE_401 },
}
```

---

## 4. Public Routes

Public routes (no JWT required) must **not** include a `security` field.
The absence of the field in the OpenAPI spec signals "no auth required":

```typescript
schema: {
  tags: [SWAGGER_TAGS.PUBLIC],
  summary: 'List published courses',
  response: { 200: successResponse(coursesListSchema) },
}
```

---

## 5. Copy-Paste Templates

### Basic CRUD route (GET list)

```typescript
import { z } from "zod";
import { SWAGGER_TAGS } from "../../swagger/tags";
import {
  RESPONSE_401,
  RESPONSE_500,
  successResponse,
} from "../../swagger/responses";
import { BEARER_AUTH } from "../../swagger/security";

app.get(
  "/courses",
  {
    schema: {
      tags: [SWAGGER_TAGS.ADMIN_COURSES],
      summary: "List all courses for the authenticated creator",
      security: BEARER_AUTH,
      response: {
        200: successResponse(
          z.object({
            items: z.array(
              z.object({
                id: z.string().uuid(),
                title: z.string(),
                status: z.enum(["draft", "published"]),
              }),
            ),
            pagination: z.object({
              total: z.number(),
              limit: z.number(),
              currentPage: z.number(),
              totalPages: z.number(),
            }),
          }),
        ),
        401: RESPONSE_401,
        500: RESPONSE_500,
      },
    },
  },
  async (request, reply) => {
    // handler logic
  },
);
```

### Protected POST route (create resource)

```typescript
import { z } from "zod";
import { SWAGGER_TAGS } from "../../swagger/tags";
import {
  RESPONSE_401,
  RESPONSE_403,
  RESPONSE_422,
  RESPONSE_500,
  successResponse,
} from "../../swagger/responses";
import { BEARER_AUTH } from "../../swagger/security";

app.post(
  "/courses",
  {
    schema: {
      tags: [SWAGGER_TAGS.ADMIN_COURSES],
      summary: "Create a new course",
      security: BEARER_AUTH,
      body: z.object({
        title: z.string().min(3).max(120),
        description: z.string().optional(),
        price: z.number().positive(),
      }),
      response: {
        201: successResponse(z.object({ id: z.string().uuid() })),
        401: RESPONSE_401,
        403: RESPONSE_403,
        422: RESPONSE_422,
        500: RESPONSE_500,
      },
    },
  },
  async (request, reply) => {
    reply.code(201);
    // handler logic
  },
);
```

### Route with URL params

```typescript
import { z } from "zod";
import { SWAGGER_TAGS } from "../../swagger/tags";
import {
  RESPONSE_401,
  RESPONSE_404,
  RESPONSE_500,
  successResponse,
} from "../../swagger/responses";
import { BEARER_AUTH } from "../../swagger/security";

app.get(
  "/courses/:courseId",
  {
    schema: {
      tags: [SWAGGER_TAGS.ADMIN_COURSES],
      summary: "Get course details by ID",
      security: BEARER_AUTH,
      params: z.object({
        courseId: z.string().uuid(),
      }),
      response: {
        200: successResponse(
          z.object({
            id: z.string().uuid(),
            title: z.string(),
            modulesCount: z.number(),
          }),
        ),
        401: RESPONSE_401,
        404: RESPONSE_404,
        500: RESPONSE_500,
      },
    },
  },
  async (request, reply) => {
    const { courseId } = request.params;
    // handler logic
  },
);
```

---

## 6. How to View the Docs

Start the API in development mode:

```bash
pnpm dev --filter api
```

Then open: [http://localhost:3002/docs](http://localhost:3002/docs)

The Swagger UI will be available with all annotated routes listed under their respective tags.
You can authorize directly in the UI using the **Authorize** button (top-right) and paste a JWT.

---

## 7. Common Mistakes

| Mistake                                                  | Fix                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| Using a raw tag string like `tags: ['auth']`             | Use `tags: [SWAGGER_TAGS.AUTH]`                                      |
| Hardcoding `security: [{ BearerAuth: [] }]`              | Import and use `BEARER_AUTH`                                         |
| Missing `response[200]`                                  | Always wrap with `successResponse(yourSchema)`                       |
| Returning plain object without `successResponse` wrapper | The `data` field must match the schema passed to `successResponse()` |
| Adding `security` field to public routes                 | Only add `security` when JWT is verified in the handler              |
| Not importing `z` from `'zod'` separately                | Always `import { z } from 'zod'` — don't rely on re-exports          |
