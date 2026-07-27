# Rupa (রূপা)

A bilingual marketplace for Bangladeshi women — housewives, artisans, and home cooks — to sell handmade products, handicrafts, homemade food, and recipes.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/rupa run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter + React Query
- API: Express 5 + custom JWT auth + Zod validation
- DB: PostgreSQL + Drizzle ORM
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API server)

## Where things live

- API spec & source of truth: `lib/api-spec/openapi.yaml`
- Generated React Query hooks: `lib/api-client-react/src/generated/api.ts`
- Generated Zod validators: `lib/api-zod/src/generated/api.ts`
- DB schema: `lib/db/src/schema/`
- API routes: `artifacts/api-server/src/routes/`
- Frontend pages: `artifacts/rupa/src/pages/`
- Frontend components: `artifacts/rupa/src/components/`
- Auth context & JWT setup: `artifacts/rupa/src/context/auth.tsx`, `artifacts/api-server/src/middlewares/auth.ts`

## Architecture decisions

- Custom JWT auth stored in `localStorage` as `rupa_token`, signed with `SESSION_SECRET`.
- Generated API client is consumed by the frontend; all routes validated by generated Zod schemas in the API server.
- Cart is persisted in the DB (`cart_items`) and requires authentication.
- Orders are simplified to a single seller per order (first product's seller).
- Payments are recorded as an enum (`bKash`, `Nagad`, `Rocket`, `COD`) without external payment SDK integration in v1.
- Categories are seeded, not user-managed.

## Product

- Buyers can browse products, recipes, and sellers; add items to cart; checkout with Bangladeshi payment methods; track orders; and leave reviews.
- Sellers can manage their store dashboard, add products and recipes, view revenue stats, and update order statuses.
- The app supports both English and Bengali labels (Bengali content is user-provided via `titleBn`, `nameBn`, etc.).

## User preferences

- App name: Rupa (রূপা) — chosen by user.
- Auth: custom JWT, not Clerk or Replit Auth.
- Payment methods: bKash, Nagad, Rocket, COD.

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks and validators, then `pnpm run typecheck:libs` to rebuild lib types.
- The generated React Query hooks require `queryKey` in the `query` option due to the Orval template's `UseQueryOptions` typing.
- DB schema changes must be pushed with `pnpm --filter @workspace/db run push` before the API server will see new tables/columns.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
