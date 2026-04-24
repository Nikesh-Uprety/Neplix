# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Key Commands

```bash
# Run individual packages
pnpm --filter @workspace/nepalix run dev          # Frontend dev server (port 5173)
pnpm --filter @workspace/api-server run dev       # API server (port 3001)

# Build & typecheck
pnpm run typecheck                                 # Full typecheck across all packages
pnpm run build                                     # Typecheck + build all packages

# Database
NEON_DATABASE_URL=... pnpm --filter @workspace/db run push  # Push schema changes (dev only)

# API codegen (from OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen
```

## Architecture

pnpm monorepo with two workspace roots: `artifacts/` (deployable apps) and `lib/` (shared packages).

```
artifacts/
  nepalix/        — React + Vite frontend (marketing site + auth UI)
  api-server/     — Express 5 API server, bundled with esbuild
lib/
  db/             — Drizzle ORM schema + client (Neon PostgreSQL)
  api-zod/        — Zod schemas generated from OpenAPI spec
  api-spec/       — OpenAPI spec + Orval codegen config
  api-client-react/ — React Query hooks generated from spec
```

### Request flow
The Vite dev server proxies `/api` → port 3001 (api-server). In production, nginx or Railway routes `/api` to the api-server and `/` to the static frontend build.

### Database
- **Connection**: `NEON_DATABASE_URL` (primary) → `DATABASE_PUBLIC_URL` → `DATABASE_URL` (fallback order in `lib/db/src/index.ts`)
- **Schema tables**: `users`, `sessions`, `demo_bookings`, `contact_messages`
- **ORM**: Drizzle with `node-postgres` Pool; SSL always enabled (`rejectUnauthorized: false`)

### Authentication
Cookie-based sessions (7-day expiry), bcryptjs (12 rounds). Session middleware lives in `artifacts/api-server/src/middlewares/`. Frontend auth state managed via `AuthContext` in `artifacts/nepalix/src/context/AuthContext.tsx`.

### API Server build
`artifacts/api-server/build.mjs` uses esbuild to bundle the entire server into `dist/index.mjs` (ESM). The `esbuild-plugin-pino` handles pino's worker threads. Start with `node --enable-source-maps ./dist/index.mjs`.

### Deployment (Railway)
- The `Dockerfile` at repo root builds the **nepalix frontend only** (static nginx on port 10000).
- The **api-server** is a separate Railway service — it reads `PORT` from env and binds to it.
- Required env vars for api-server: `NEON_DATABASE_URL`, `PORT` (set by Railway automatically).
- `DATABASE_PUBLIC_URL` / `DATABASE_URL` are accepted as aliases for the DB connection string.
