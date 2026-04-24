# Monthly Release Train

## Cadence

- Week 1: roadmap lock and scope freeze.
- Week 2: feature development behind flags.
- Week 3: regression pass + staging soak.
- Week 4: production rollout + patch window.

## Release Gates

1. Database migration dry run on staging.
2. Tenant isolation smoke tests pass.
3. Billing flow verification (initiate, verify, cancel).
4. Admin core routes parity checks pass.
5. Error budget and monitoring dashboards reviewed.

## Hotfix Policy

- Critical tenant data leak: patch in < 4 hours.
- Billing/payment regression: patch in < 8 hours.
- UI-only regressions: patch in next patch release.

## Branching

- `main`: production-ready.
- `release/<yyyy-mm>`: frozen release branch.
- `hotfix/<ticket-id>`: emergency patch branches.
