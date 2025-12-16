# Authentication Helpers

## Server-Side (RSC, Server Actions, API Routes)

```ts
import { getUser, getRequiredUser } from "@/lib/auth/auth-user";
import { getCurrentOrg, getRequiredCurrentOrg } from "@/lib/organizations/get-org";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
```

### Get Optional User

Returns `null` if not authenticated:

```ts
const user = await getUser();
if (!user) {
  // Handle unauthenticated state
}
```

### Get Required User

Throws error if not authenticated (use in protected pages/actions):

```ts
const user = await getRequiredUser();
// user is guaranteed to exist
```

### Get Current Organization

```ts
// Optional - returns null if no org
const org = await getCurrentOrg();

// Required - throws if no org
const org = await getRequiredCurrentOrg();

// Cached (for RSC) - use when calling multiple times in same request
const org = await getRequiredCurrentOrgCache();
```

## Client-Side (React Components)

```ts
import { useSession } from "@/lib/auth/auth-client";
```

### useSession Hook

```tsx
function MyComponent() {
  const session = useSession();

  if (session.isPending) return <Loading />;
  if (!session.data?.user) return <LoginPrompt />;

  return <div>Hello {session.data.user.name}</div>;
}
```

## Page Protection Pattern

For protected pages, use `getRequiredUser()` at the top:

```tsx
export default async function ProtectedPage() {
  const user = await getRequiredUser();

  return <Dashboard user={user} />;
}
```

For organization-scoped pages (use cached version in RSC):

```tsx
export default async function OrgPage() {
  const org = await getRequiredCurrentOrgCache();

  return <OrgDashboard org={org} />;
}
```
