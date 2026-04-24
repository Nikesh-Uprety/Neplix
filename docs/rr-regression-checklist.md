# RR Parity Regression Checklist

Run this before every monthly release.

## Admin Core

- [ ] `/admin/dashboard` loads without API errors.
- [ ] Product CRUD works and is tenant-scoped.
- [ ] Order list/detail/update works and is tenant-scoped.
- [ ] Customer CRUD works and is tenant-scoped.
- [ ] Inventory adjust/set works and is tenant-scoped.
- [ ] Promo code CRUD works and is tenant-scoped.
- [ ] Marketing CRUD works and is tenant-scoped.
- [ ] Notifications read/read-all/create works and is tenant-scoped.
- [ ] Bills list/summary only includes current tenant.

## Tenant & Auth

- [ ] New user registration creates tenant store + membership.
- [ ] Subdomain-based tenant resolution selects correct tenant context.
- [ ] User without membership receives 403 on admin data endpoints.

## Billing

- [ ] Free plan trial is provisioned on signup.
- [ ] Upgrade payment initiation works for selected paid plans.
- [ ] Payment verification upgrades subscription.

## Platform Admin

- [ ] `/admin/platform` loads store list and platform stats.
- [ ] Superadmin can change store status.
- [ ] Feature flags endpoint returns expected values.
