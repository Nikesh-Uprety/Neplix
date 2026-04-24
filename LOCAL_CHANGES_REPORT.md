# Local Changes Report

Generated on 2026-04-24 for the current uncommitted working tree in this repository.

## Scope

This report summarizes local changes that are present in the working tree but not yet committed or pushed.

- Tracked modified files: 27
- Untracked new files: 27
- Tracked diff summary: 541 insertions, 215 deletions

## High-Level Summary

The local work appears to be a second large feature pass on top of the already-committed admin panel. The main themes are:

1. Multi-tenant store model
2. Platform admin and user/store management
3. Media library and storefront content management
4. Admin UI expansion and routing updates
5. Local dev/auth configuration alignment

## What Seems To Have Been Implemented

### 1. Multi-tenant store architecture

New tenant-oriented schema and backend logic have been added so the app can move from a single-store-per-user model toward a membership-based store model.

Key additions:

- `lib/db/src/schema/stores.ts`
  - Adds `stores`
  - Adds `store_domains`
  - Adds `store_memberships`
  - Adds `store_subscriptions`
  - Adds `store_usage_counters`
- `lib/db/src/schema/storefront-pages.ts`
  - Adds `storefront_pages`
- `artifacts/api-server/src/lib/tenant.ts`
  - Provisions a store for a user
  - Creates owner membership
  - Sets `users.store_id` and `users.active_store_id`
- `artifacts/api-server/src/middlewares/tenant.ts`
  - Resolves the active tenant from `activeStoreId`, fallback `storeId`, and optional host/domain lookup
  - Requires an active membership before allowing tenant-scoped access

Migration intent is also documented in:

- `docs/multi-tenant-migration-strategy.md`

### 2. Platform admin capabilities

The existing admin backend has been extended toward platform-level administration, especially for stores and users.

Key signals:

- `artifacts/api-server/src/routes/admin.ts`
  - Adds superadmin/owner-only flows
  - Adds feature flag exposure
  - Adds user listing and patching
  - Adds store-oriented admin data access
- `artifacts/api-server/src/lib/feature-flags.ts`
  - Adds environment-based feature flag evaluation for:
    - `FEATURE_POS`
    - `FEATURE_MEDIA_LIBRARY`
    - `FEATURE_CANVAS_BUILDER`
    - `FEATURE_PLATFORM_ADMIN`
- `artifacts/nepalix/src/pages/admin/platform.tsx`
  - Adds a platform admin UI for aggregate stats and store listing

### 3. Media library and storefront content management

There is a clear new media/storefront management slice in both API and frontend.

Backend:

- `artifacts/api-server/src/routes/admin-media.ts`
  - Adds image listing, creation, deletion
  - Adds bucket listing/creation
  - Adds storefront image filtering
- `artifacts/api-server/src/routes/admin-landing.ts`
  - Adds CRUD for tenant-scoped storefront pages
- `lib/db/src/schema/media.ts`
  - New media-related tables

Frontend:

- `artifacts/nepalix/src/pages/admin/images.tsx`
- `artifacts/nepalix/src/pages/admin/buckets.tsx`
- `artifacts/nepalix/src/pages/admin/storefront-images.tsx`
- `artifacts/nepalix/src/pages/admin/landing-page.tsx`
- `artifacts/nepalix/src/pages/admin/canvas.tsx`

### 4. Admin UI expansion

The frontend routing and admin shell have continued to expand beyond the first committed admin pass.

Modified:

- `artifacts/nepalix/src/App.tsx`
  - Adds many more `/admin/...` routes
- `artifacts/nepalix/src/components/admin/AdminLayout.tsx`
  - Expanded admin layout/navigation
- `artifacts/nepalix/src/lib/api.ts`
  - Significant API client growth for new admin resources

New admin pages:

- `artifacts/nepalix/src/pages/admin/platform.tsx`
- `artifacts/nepalix/src/pages/admin/pos.tsx`
- `artifacts/nepalix/src/pages/admin/logs.tsx`
- `artifacts/nepalix/src/pages/admin/images.tsx`
- `artifacts/nepalix/src/pages/admin/buckets.tsx`
- `artifacts/nepalix/src/pages/admin/storefront-images.tsx`
- `artifacts/nepalix/src/pages/admin/landing-page.tsx`
- `artifacts/nepalix/src/pages/admin/canvas.tsx`
- `artifacts/nepalix/src/pages/admin/orders-new.tsx`
- `artifacts/nepalix/src/pages/admin/products-layout.tsx`
- `artifacts/nepalix/src/components/admin/AdminPlaceholder.tsx`

This suggests a pattern of shipping real pages for some sections and placeholder shells for others.

### 5. POS, logs, and supporting admin modules

More backend routes have been introduced for operational/admin tooling:

- `artifacts/api-server/src/routes/admin-pos.ts`
- `artifacts/api-server/src/routes/admin-logs.ts`

These are matched by new frontend pages:

- `artifacts/nepalix/src/pages/admin/pos.tsx`
- `artifacts/nepalix/src/pages/admin/logs.tsx`

### 6. Usage tracking and subscription/store support

There is also groundwork for usage-based or per-store plan logic:

- `artifacts/api-server/src/lib/usage.ts`
  - Adds monthly usage counter incrementing for metrics like:
    - `orders`
    - `products`
    - `customers`
    - `staff`
- `lib/db/src/schema/stores.ts`
  - Includes `store_subscriptions` and `store_usage_counters`

### 7. Auth and onboarding changes

Tracked changes suggest auth now participates in tenant/store bootstrap:

- `artifacts/api-server/src/routes/auth.ts`
  - Uses store provisioning during onboarding
  - Includes `activeStoreId` in auth response
  - Local frontend URL default was aligned to `http://localhost:3000`
- `lib/db/src/schema/users.ts`
  - Includes `active_store_id`

## Changed Files By Area

### Backend API and server

Modified tracked files:

- `artifacts/api-server/src/index.ts`
- `artifacts/api-server/src/lib/featureMatrix.ts`
- `artifacts/api-server/src/routes/admin-analytics.ts`
- `artifacts/api-server/src/routes/admin-bills.ts`
- `artifacts/api-server/src/routes/admin-customers.ts`
- `artifacts/api-server/src/routes/admin-inventory.ts`
- `artifacts/api-server/src/routes/admin-marketing.ts`
- `artifacts/api-server/src/routes/admin-notifications.ts`
- `artifacts/api-server/src/routes/admin-orders.ts`
- `artifacts/api-server/src/routes/admin-products.ts`
- `artifacts/api-server/src/routes/admin-promo-codes.ts`
- `artifacts/api-server/src/routes/admin.ts`
- `artifacts/api-server/src/routes/auth.ts`
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/routes/payments.ts`
- `artifacts/api-server/src/routes/subscriptions.ts`

New untracked backend files:

- `artifacts/api-server/src/lib/feature-flags.ts`
- `artifacts/api-server/src/lib/tenant.ts`
- `artifacts/api-server/src/lib/usage.ts`
- `artifacts/api-server/src/middlewares/tenant.ts`
- `artifacts/api-server/src/routes/admin-landing.ts`
- `artifacts/api-server/src/routes/admin-logs.ts`
- `artifacts/api-server/src/routes/admin-media.ts`
- `artifacts/api-server/src/routes/admin-pos.ts`

### Frontend app and admin UI

Modified tracked files:

- `artifacts/nepalix/src/App.tsx`
- `artifacts/nepalix/src/components/admin/AdminLayout.tsx`
- `artifacts/nepalix/src/lib/api.ts`
- `artifacts/nepalix/vite.config.ts`

New untracked frontend files:

- `artifacts/nepalix/src/components/admin/AdminPlaceholder.tsx`
- `artifacts/nepalix/src/pages/admin/buckets.tsx`
- `artifacts/nepalix/src/pages/admin/canvas.tsx`
- `artifacts/nepalix/src/pages/admin/images.tsx`
- `artifacts/nepalix/src/pages/admin/landing-page.tsx`
- `artifacts/nepalix/src/pages/admin/logs.tsx`
- `artifacts/nepalix/src/pages/admin/orders-new.tsx`
- `artifacts/nepalix/src/pages/admin/platform.tsx`
- `artifacts/nepalix/src/pages/admin/pos.tsx`
- `artifacts/nepalix/src/pages/admin/products-layout.tsx`
- `artifacts/nepalix/src/pages/admin/storefront-images.tsx`

### Database and auth policy

Modified tracked files:

- `lib/db/src/auth-policy.ts`
- `lib/db/src/schema/customers.ts`
- `lib/db/src/schema/index.ts`
- `lib/db/src/schema/orders.ts`
- `lib/db/src/schema/plans.ts`
- `lib/db/src/schema/products.ts`
- `lib/db/src/schema/users.ts`

New untracked DB/schema files:

- `lib/db/src/schema/media.ts`
- `lib/db/src/schema/storefront-pages.ts`
- `lib/db/src/schema/stores.ts`

### Documentation

New untracked docs:

- `docs/monthly-release-train.md`
- `docs/multi-tenant-migration-strategy.md`
- `docs/rr-parity-matrix.md`
- `docs/rr-regression-checklist.md`

### Repo guidance

New untracked file:

- `AGENTS.md`

## How To Inspect The Local Work

### Quick overview

```bash
git status --short
git diff --stat
git ls-files --others --exclude-standard
```

### Full uncommitted diff

```bash
git diff
```

### Inspect by feature area

```bash
git diff -- artifacts/api-server/src/routes
git diff -- artifacts/nepalix/src/pages/admin
git diff -- lib/db/src/schema
```

### Inspect one file at a time

```bash
git diff -- artifacts/api-server/src/routes/admin.ts
git diff -- artifacts/api-server/src/lib/tenant.ts
git diff -- artifacts/api-server/src/routes/admin-media.ts
git diff -- artifacts/nepalix/src/App.tsx
git diff -- artifacts/nepalix/src/lib/api.ts
git diff -- lib/db/src/schema/stores.ts
```

### Review only newly created untracked files

```bash
git ls-files --others --exclude-standard
```

Then open individual files with your editor or inspect from terminal, for example:

```bash
sed -n '1,220p' artifacts/api-server/src/lib/tenant.ts
sed -n '1,220p' artifacts/api-server/src/routes/admin-media.ts
sed -n '1,220p' lib/db/src/schema/stores.ts
```

## Practical Interpretation

If you are trying to understand “what Cursor implemented locally,” the best short summary is:

- it expanded the app from a regular admin dashboard toward a multi-tenant commerce/admin platform
- it added store-aware backend infrastructure
- it added platform/admin/media/storefront management features
- it introduced new schema needed for tenant/store features
- it wired new frontend admin pages and routes for those capabilities

## Caution

Because these changes are still local and uncommitted:

- they may not all be finished
- some new files may be scaffolds or placeholders
- tracked diffs do not include the full content of untracked files unless you open them directly
- database changes implied by the new schema will need matching schema pushes/migrations before all code paths can run cleanly

## Suggested Next Steps

1. Review the new tenant-related files first:
   - `lib/db/src/schema/stores.ts`
   - `artifacts/api-server/src/lib/tenant.ts`
   - `artifacts/api-server/src/middlewares/tenant.ts`
2. Review new route registration and frontend routing:
   - `artifacts/api-server/src/routes/index.ts`
   - `artifacts/nepalix/src/App.tsx`
3. Review the API surface expansion:
   - `artifacts/nepalix/src/lib/api.ts`
   - `artifacts/api-server/src/routes/admin.ts`
4. Decide which local changes are ready to keep, split, or discard before committing.
