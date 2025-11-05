# Implementation Plan: Optimize Middleware Caching and Database Performance with Redis

## Overview

This plan implements a two-phase optimization strategy using **ioredis** following the exact lumail.io pattern:

1. **Phase 1: Redis Infrastructure** - Set up Redis client, cache keys, invalidation helpers, and ONE critical index
2. **Phase 2: Query & Caching Optimization** - Integrate caching into middleware and optimize queries

**Expected Performance**: Reduce middleware execution from ~200-500ms to <20ms (~90% improvement)

**Index Strategy**: Add **ONLY 1 critical index** - `Member @@index([userId, organizationId])`. This compound index targets the exact middleware query that checks org membership. It provides 10-25x speedup (20-50ms → 1-2ms) on the 5-15% of requests that miss cache. All other potential indexes are unnecessary with Redis caching.

**Architecture Pattern**: Following lumail.io's proven approach:

- `src/lib/redis.ts` - Redis client singleton using ioredis
- `src/lib/redis-keys.ts` - Centralized cache key generators and TTL constants
- `src/lib/cache-invalidation.ts` - Reusable cache invalidation functions
- Redis is **required** - app won't start without proper Redis configuration

---

## Dependencies

### Installation Order

1. Install `ioredis` package first
2. Create Redis infrastructure files (redis.ts, redis-keys.ts, cache-invalidation.ts)
3. Update environment variables and documentation
4. Integrate caching into middleware and queries
5. Update auth configuration for Better Auth cookie caching
6. Monitor performance and add indexes ONLY if specific queries remain slow (unlikely)

### Prerequisites

- Redis server must be available (Railway, Redis Cloud, Upstash via native protocol, or local)
- Environment variables: `REDIS_URL` (required)

---

## File Changes

### Phase 1: Redis Infrastructure Setup

#### `package.json`

- Add dependency: `ioredis` (latest version, e.g., ^5.3.2)
- Add types: `@types/ioredis` as dev dependency
- Consider: ioredis has built-in TypeScript support, types package may not be needed

#### `src/lib/redis.ts` (NEW FILE)

- Create Redis client singleton using ioredis
- Initialize with connection URL from `process.env.REDIS_URL`
- Configure connection options: retry strategy, connection timeout, keepAlive
- Export single `redisClient` instance
- Add connection error handling that throws if Redis unavailable (required setup)
- Pattern: Follow ioredis singleton pattern for Next.js (avoid multiple connections)
- Consider: Enable `lazyConnect: false` to fail fast at startup if Redis unreachable
- Consider: Add connection logging for debugging

#### `src/lib/redis-keys.ts` (NEW FILE)

- Create `CacheKeys` object with factory functions for all cache key patterns
- Add keys for:
  - `userOrgs(userId: string)` - User's organizations list
  - `orgMember(orgSlug: string, userId: string)` - Specific user membership in org
  - `orgBySlug(slug: string)` - Organization lookup by slug
  - `sessionData(sessionId: string)` - Session validation results
  - `orgSubscription(orgId: string)` - Stripe subscription data cache
- Mark as `const` object with `as const` for type safety
- Create `CacheTTL` object with TTL constants in seconds:
  - `USER_ORGS: 60 * 10` (10 minutes)
  - `ORG_MEMBER: 60 * 5` (5 minutes)
  - `ORG_SLUG: 60 * 30` (30 minutes)
  - `SESSION_DATA: 60 * 15` (15 minutes)
  - `ORG_SUBSCRIPTION: 60 * 60` (1 hour)
- Mark CacheTTL as `const` with `as const` for type safety
- Pattern: Match lumail.io's naming convention exactly

#### `src/lib/cache-invalidation.ts` (NEW FILE)

- Import redisClient from redis.ts
- Import CacheKeys from redis-keys.ts
- Import logger from logger.ts (if exists, or create basic console logger)
- Create async function `invalidateUserOrgsCache(userId: string)`
  - Delete cache key: `CacheKeys.userOrgs(userId)`
  - Wrap in try-catch, log errors without throwing
- Create async function `invalidateOrgMemberCache(orgSlug: string, userId: string)`
  - Delete cache key: `CacheKeys.orgMember(orgSlug, userId)`
  - Wrap in try-catch, log errors without throwing
- Create async function `invalidateAllUserCaches(userId: string)`
  - Delete `CacheKeys.userOrgs(userId)`
  - Use pattern matching: `org:*:member:${userId}` to find all org member caches
  - Use `redisClient.keys(pattern)` to get matching keys
  - Batch delete with `redisClient.del(...keys)` if keys found
  - Wrap in try-catch, log errors without throwing
- Create async function `invalidateOrgSlugCache(slug: string)`
  - Delete cache key: `CacheKeys.orgBySlug(slug)`
  - Wrap in try-catch, log errors without throwing
- Create async function `invalidateAllOrgMemberCaches(orgSlug: string)`
  - Pattern: `org:${orgSlug}:member:*`
  - Find and delete all matching keys
  - Wrap in try-catch, log errors without throwing
- Create async function `invalidateOrgSubscription(orgId: string)`
  - Delete cache key: `CacheKeys.orgSubscription(orgId)`
  - Wrap in try-catch, log errors without throwing
- Pattern: All invalidation functions should be fire-and-forget (don't throw errors)
- Consider: Add batch invalidation function for multiple keys at once

#### `.env.example`

- Add Redis section after database section
- Add required variable: `REDIS_URL="redis://localhost:6379"`
- Add comment explaining it's required for production
- Add examples for common providers:
  - Railway: `redis://default:password@host:port`
  - Redis Cloud: `redis://default:password@host:port`
  - Upstash (via native): `redis://default:token@host:port`
  - Local: `redis://localhost:6379`
- Pattern: Follow lumail.io's .env-template structure

#### `README.md`

- Add new section "## 🚀 Caching" after deployment section
- Explain that Redis is required for production
- Link to setup documentation: `docs/redis-setup.md`
- List supported providers: Railway, Redis Cloud, Upstash, self-hosted
- Add performance benefit note: "90% reduction in database queries"
- Consider: Add badge showing Redis requirement

#### `docs/redis-setup.md` (NEW FILE)

- Create comprehensive Redis setup guide
- Section 1: "Overview" - Explain why Redis is required
- Section 2: "Quick Start" - Simplest path (Railway recommended)
- Section 3: "Provider Options"
  - Railway Redis: Step-by-step with screenshots reference
  - Redis Cloud: Free tier instructions
  - Upstash: Native Redis protocol (not REST API)
  - Self-hosted: Docker command
  - Local development: Docker for local Redis
- Section 4: "Environment Variables"
  - Explain `REDIS_URL` format
  - Provide examples for each provider
  - Note: Connection string includes username/password
- Section 5: "Verification"
  - How to test Redis connection
  - Common connection issues and fixes
- Section 6: "Pricing"
  - Comparison table: Railway ($5/mo), Redis Cloud (free tier), Upstash ($10/mo)
- Pattern: Match lumail.io documentation style if reference available

---

### Phase 1b: Add Critical Database Index

#### `prisma/schema/better-auth.prisma` (or wherever Member model is defined)

- Locate `Member` model (around line 96-106 in better-auth.prisma)
- Add **ONLY ONE** compound index after the model fields, before `@@map` directive:
  ```prisma
  @@index([userId, organizationId])
  ```
- **Why this specific index:**
  - Targets the exact middleware query: `members: { some: { userId } }`
  - Generated SQL checks: `WHERE member.userId = X AND member.organizationId = Y`
  - Without index: Sequential scan of 10,000+ member rows (~20-50ms)
  - With compound index: O(log n) lookup (~1-2ms) = **10-25x speedup**
  - Also helps: Getting all user's orgs (uses userId prefix of compound index)
- **Why NOT add other indexes:**
  - Session.token: Already has `@@unique([token])` which creates implicit index ✅
  - Session.userId: Not used in middleware hot path (only for session cleanup)
  - Account.userId: Only OAuth login flow (infrequent, acceptable without index)
  - Member.organizationId alone: Less useful - we're optimizing query to not load all members
  - Invitation.\*: Low-frequency queries, Redis caching handles them fine
  - Following lumail.io philosophy: Minimal indexes + aggressive caching
- Pattern: Place index after `role` field, before `@@map("member")` line
- Consider: Compound index order matters - [userId, organizationId] allows prefix scans on userId

#### Generate and run migration

- Run command: `pnpm prisma migrate dev --name add-member-userId-organizationId-index`
- This will create migration file in `prisma/migrations/`
- Review generated SQL - should see: `CREATE INDEX "member_userId_organizationId_idx" ON "member"("userId", "organizationId");`
- Index creation is **non-blocking** on PostgreSQL (uses CONCURRENTLY by default)
- For production: Use `pnpm prisma migrate deploy` in CI/CD pipeline
- Expected index size: ~500KB-2MB (negligible storage impact)
- Write performance impact: <1% (single index, not in write-heavy path)

---

### Phase 2: Middleware and Query Optimization

#### `src/lib/auth/middleware-utils.ts`

- Add imports at top:
  - `import { redisClient } from '@/lib/redis'`
  - `import { CacheKeys, CacheTTL } from '@/lib/redis-keys'`
  - Import logger if available
- Locate `findUserOrganization` function (around line 54-63 based on exploration)
- Add caching logic at function start:
  - Create cache key: `const cacheKey = CacheKeys.orgMember(slug, userId)`
  - Try to get cached value: `const cached = await redisClient.get(cacheKey)`
  - If cached, parse JSON and return: `return JSON.parse(cached)`
  - Wrap in try-catch to handle cache errors gracefully
- Keep existing database query as fallback
- After database query succeeds, cache the result:
  - Use `redisClient.setex(cacheKey, CacheTTL.ORG_MEMBER, JSON.stringify(org))`
  - Wrap in try-catch, log error if caching fails
  - Return org even if cache write fails
- Pattern: Match lumail.io's exact pattern from lines 57-92
- Consider: Add cache hit/miss logging for monitoring
- Locate `getFirstUserOrganization` function (if exists, around line 142)
- Apply same caching pattern using `CacheKeys.userOrgs(userId)`
- Cache the array of organizations with `CacheTTL.USER_ORGS`
- Consider: May need to handle array serialization/deserialization

#### `src/lib/auth.ts`

- Locate betterAuth configuration object
- Find or add `session` configuration section
- Add cookie cache configuration:
  ```
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300 // 5 minutes
    }
  }
  ```
- Pattern: Add after existing session config, or create session object if missing
- Consider: Cookie cache works alongside Redis cache for double performance boost

#### `src/lib/organizations/get-org.ts`

- Locate `getCurrentOrg` function (around line 28-38)
- Replace `include: { members: { include: { user: true } } }` with selective query
- Change to:
  ```
  include: {
    members: {
      where: { userId: user.session.userId },
      select: { id: true, role: true }
    }
  }
  ```
- Remove invitations from default include (load separately where needed)
- Add separate query for owner email if needed:
  - Only fetch when actually displaying owner contact
  - Use `findFirst` with `where: { organizationId: org.id, role: 'owner' }`
  - Select only `user: { select: { email: true } }`
- Pattern: Reduce data fetching by 80-90% (only current user's membership vs all members)
- Consider: Add caching for getCurrentOrg using `CacheKeys.orgBySlug(slug)`

#### `src/lib/organizations/get-org-subscription.ts`

- Locate function that calls Stripe API (around line 25-27)
- Add caching before Stripe call:
  - Create cache key: `CacheKeys.orgSubscription(organizationId)`
  - Try to get cached subscription data
  - If cached and fresh (check cached timestamp), return cached data
- Keep Stripe API call as fallback for cache miss
- Cache Stripe response with `CacheTTL.ORG_SUBSCRIPTION` (1 hour)
- Store complete subscription object including status
- Pattern: Cache external API calls aggressively (1 hour TTL acceptable for billing data)
- Consider: Add webhook handler to invalidate cache on subscription changes
- Consider: Add `invalidateOrgSubscription()` calls in webhook handlers

#### `src/query/org/get-orgs-members.ts`

- Locate `getOrgsMembers` function (around line 5-22)
- Add pagination parameters to function signature: `page = 1, pageSize = 50`
- Add to query: `skip: (page - 1) * pageSize`
- Add to query: `take: pageSize`
- Add to query: `orderBy: { createdAt: 'desc' }`
- Consider: Also return total count for pagination UI
- Pattern: Standard cursor-based pagination for member lists
- Consider: Cache paginated results with page number in cache key

---

## Testing Strategy

### Unit Tests

- Create `src/lib/__tests__/redis-keys.test.ts`
  - Test all CacheKeys functions return correct key format
  - Test CacheTTL constants are correct values
  - Verify no key collisions between different entities
- Create `src/lib/__tests__/cache-invalidation.test.ts`
  - Mock redisClient.del and redisClient.keys
  - Test each invalidation function calls correct Redis methods
  - Verify pattern matching for bulk invalidations
  - Test error handling (cache errors don't throw)

### Integration Tests

- Create `src/lib/auth/__tests__/middleware-utils-cache.test.ts`
  - Test `findUserOrganization` returns cached value on second call
  - Test cache miss falls back to database
  - Test cache write failures don't break functionality
  - Mock Redis and Prisma to verify interaction
- Test Better Auth cookie cache integration
  - Verify session validation uses cookie first
  - Test cache invalidation on logout

### Manual Verification Steps

1. Start local Redis: `docker run -d -p 6379:6379 redis:alpine`
2. Set `REDIS_URL=redis://localhost:6379` in `.env.local`
3. Run dev server: `pnpm dev`
4. Navigate to org page and check Redis keys: `redis-cli KEYS "*"`
5. Verify cache hit logs on page refresh
6. Test cache invalidation: Update org, verify cache cleared
7. Check middleware performance with browser devtools network tab
8. Benchmark: Measure time to first byte before and after caching

### Performance Testing

- Use Prisma logging to track query count reduction
- Add request timing middleware to measure middleware execution time
- Goal: <20ms middleware execution (vs ~200-500ms before)
- Goal: 90% cache hit rate after warmup period
- Monitor Redis memory usage in production

---

## Documentation Updates

### `README.md` Updates

- Add Redis as requirement in "Prerequisites" section
- Update "Getting Started" with Redis setup step
- Add troubleshooting section for Redis connection issues
- Add performance metrics section showing before/after improvements

### Code Comments

- Add JSDoc comments to all cache invalidation functions
- Document cache key patterns in redis-keys.ts
- Add comments explaining TTL choices
- Document why certain functions cache vs others don't

### Migration Guide

- If users have existing now.ts installations:
  - Document Redis setup requirement
  - Provide migration script for adding indexes
  - Note: Non-breaking change, opt-in Redis

---

## Rollout Considerations

### Breaking Changes

- **None**: Redis is additive, doesn't break existing functionality
- Database indexes are non-breaking (only improve performance)
- Better Auth cookie cache is opt-in via config

### Deployment Steps

1. Add Redis instance to hosting provider (Railway, Render, etc.)
2. Set `REDIS_URL` environment variable in production
3. Deploy updated code
4. Run migration: `pnpm prisma migrate deploy` in production
5. Monitor logs for Redis connection success
6. Verify cache hit rates in Redis monitoring tools

### Rollback Plan

- If Redis issues occur:
  - Graceful degradation: Cache errors don't break app
  - Can continue without Redis (just slower)
  - Remove Redis env var to disable caching
- If index issues occur:
  - Indexes can be dropped without breaking queries
  - Run: `DROP INDEX index_name;` in database
  - Redeploy previous version if needed

### Monitoring

- Add Redis connection health check endpoint
- Monitor cache hit/miss ratios (target: >80% hit rate)
- Track middleware execution time (target: <20ms)
- Alert on Redis connection failures
- Monitor Redis memory usage (should be <100MB for typical SaaS)

### Feature Flags

- Consider: Add `ENABLE_REDIS_CACHE` env var for gradual rollout
- Default: enabled if `REDIS_URL` is set
- Allows A/B testing performance improvements

---

## Risk Mitigation

### Redis Dependency Risk

- **Risk**: Redis outage breaks app
- **Mitigation**: All cache operations wrapped in try-catch, app continues on cache errors
- **Mitigation**: Cache is performance optimization, not required for correctness

### Index Creation Risk

- **Risk**: Index creation locks tables on large datasets
- **Mitigation**: Indexes are small, lock time <1 second for most tables
- **Mitigation**: Run migration during low-traffic window
- **Mitigation**: Test in staging environment first

### Over-caching Risk

- **Risk**: Stale data shown to users
- **Mitigation**: Conservative TTLs (5-30 minutes)
- **Mitigation**: Invalidation functions called on all data mutations
- **Mitigation**: Better Auth cookie cache automatically refreshes

### Connection Pool Exhaustion

- **Risk**: Too many Redis connections
- **Mitigation**: Singleton pattern ensures one Redis client per process
- **Mitigation**: ioredis has built-in connection pooling
- **Mitigation**: Lazy connection strategy

---

## Success Criteria

### Performance Metrics

- ✅ Middleware execution time reduced by 80-90% (<20ms target)
- ✅ Database query count reduced by 80-90%
- ✅ Page load time improved by 30-50%
- ✅ Cache hit rate >80% after warmup

### Code Quality

- ✅ All cache operations have error handling
- ✅ Cache keys follow consistent naming pattern
- ✅ TTLs are reasonable and documented
- ✅ Invalidation functions exist for all cached data

### Documentation

- ✅ Redis setup guide complete and tested
- ✅ All cache functions have JSDoc comments
- ✅ README updated with Redis requirements
- ✅ Migration guide for existing users

### Testing

- ✅ Unit tests cover cache key generation
- ✅ Integration tests verify caching behavior
- ✅ Manual testing verifies cache hit/miss
- ✅ Performance benchmarks show improvements

---

## Post-Implementation Tasks

### Monitoring Setup

1. Add cache hit rate tracking
2. Set up Redis memory alerts
3. Monitor middleware execution time
4. Track database query reduction

### Optimization Opportunities

1. Add cache warming on deployment
2. Implement cache preloading for popular orgs
3. Add distributed cache locking for high-concurrency scenarios
4. Consider Redis Cluster for very high traffic

### Documentation

1. Create architecture diagram showing cache flow
2. Document cache invalidation strategy
3. Create runbook for cache issues
4. Add cache troubleshooting guide

---

## Estimated Implementation Time

- **Phase 1 (Redis Infrastructure + Index)**: 2-3 hours
  - Set up ioredis client and infrastructure: 1-1.5 hours
  - Create cache keys and invalidation helpers: 0.5-1 hour
  - Add single Member index + migration: 0.5 hour
- **Phase 2 (Integration)**: 3-4 hours
  - Integrate caching into middleware: 1-1.5 hours
  - Fix query over-fetching: 1-1.5 hours
  - Cache Stripe calls and add pagination: 1 hour
- **Testing & Documentation**: 2-3 hours
  - Write tests for cache layer: 1 hour
  - Update documentation: 1 hour
  - Performance testing: 1 hour
- **Total**: 7-10 hours (simplified from original 8-11 hours with minimal indexing)

---

## Next Steps

After plan approval:

1. Run `/epct:code .claude/tasks/01-optimize-caching-and-database` to execute this plan
2. Or run `/epct:tasks .claude/tasks/01-optimize-caching-and-database` to break plan into smaller task files
3. Review plan with team for feedback
4. Adjust TTLs based on business requirements
5. Prepare Redis instance for deployment
