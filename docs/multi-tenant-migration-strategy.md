# Multi-Tenant Migration Strategy

This document describes the safe rollout path from the current single-store user model to multi-tenant store memberships.

## Goals

- Introduce first-class tenant entities (`stores`, `store_memberships`, `store_domains`).
- Preserve backward compatibility while routes are migrated.
- Prevent tenant data leaks during rollout.

## Rollout Steps

1. **Deploy schema expansion**
   - Add new tenant tables:
     - `stores`
     - `store_domains`
     - `store_memberships`
     - `store_subscriptions`
     - `store_usage_counters`
   - Add `users.active_store_id` while keeping legacy `users.store_id`.

2. **Backfill existing users**
   - For each user with `users.store_id`:
     - Create a `store_memberships` row with role `owner` if one does not exist.
     - Set `users.active_store_id = users.store_id` where null.

3. **Backfill domain records**
   - Create primary domain rows for existing stores where hostname can be derived.
   - Mark unverified until DNS checks pass.

4. **Dual-read phase**
   - API reads tenant context from:
     1. `users.active_store_id`
     2. fallback to `users.store_id`
   - Membership checks become required for privileged routes.

5. **Dual-write phase**
   - User-store assignment updates both `users.store_id` and `store_memberships`.
   - New onboarding writes only through tenant service, then hydrates legacy field.

6. **Cutover**
   - Route authorization checks rely on memberships + active store context.
   - All CRUD endpoints enforce `store_id` scope.

7. **Cleanup (post-MVP)**
   - Remove legacy fallback paths.
   - Remove `users.store_id` once no code path depends on it.

## Operational Notes

- Apply schema using `pnpm --filter @workspace/db run push` in staging first.
- Run backfill scripts in idempotent batches (recommended chunk size: 500 users).
- Keep audit logs for membership and domain mutations.
