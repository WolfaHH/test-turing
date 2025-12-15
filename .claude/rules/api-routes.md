---
paths: "**/route.ts"
---

# API Routes with Zod Route

**CRITICAL**: All API routes (`route.ts` files) MUST use `@/lib/zod-route.ts`

ALWAYS read `src/lib/zod-route.ts` before creating any routes.

## Import

```ts
import { route, authRoute, orgRoute } from "@/lib/zod-route";
```

## Basic Route

```ts
export const POST = route
  .params(z.object({ id: z.string() })) // URL params
  .body(z.object({ name: z.string() })) // Request body
  .query(z.object({ page: z.number().optional() })) // Search params
  .handler(async (req, { params, body, query }) => {
    return { success: true };
  });
```

## Authenticated Route

Requires user to be logged in:

```ts
export const GET = authRoute
  .params(z.object({ id: z.string() }))
  .handler(async (req, { params, ctx }) => {
    // ctx.user is available
    return { data: ctx.user };
  });
```

## Organization Route

Requires user to be part of an organization with specific permissions:

```ts
export const POST = orgRoute
  .metadata({ permissions: { users: ["create"] } })
  .body(z.object({ email: z.string().email() }))
  .handler(async (req, { body, ctx }) => {
    // ctx.organization is available
    return { success: true };
  });
```

## Route Types

| Route | Use Case |
|-------|----------|
| `route` | Public endpoints, no auth required |
| `authRoute` | Requires logged-in user |
| `orgRoute` | Requires organization membership + optional permissions |

## Error Handling

Routes automatically handle errors:

- `ZodRouteError` - Returns custom status code
- `ApplicationError` - Returns 400
- Unknown errors - Returns 500 (message hidden in production)

```ts
import { ZodRouteError } from "@/lib/errors/zod-route-error";
import { ApplicationError } from "@/lib/errors/application-error";

// In handler:
throw new ZodRouteError("Not found", 404);
throw new ApplicationError("Invalid operation");
```
