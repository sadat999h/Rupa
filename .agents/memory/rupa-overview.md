---
name: Rupa marketplace overview
description: High-level overview of the Rupa marketplace app and its architecture.
---

Rupa (রূপা) is a bilingual marketplace for Bangladeshi women to sell handmade products, handicrafts, homemade food, and recipes.

**Key architecture choices:**
- Custom JWT auth stored in `localStorage` as `rupa_token`, signed with `SESSION_SECRET`.
- Express 5 API server with Zod-validated routes generated from `lib/api-spec/openapi.yaml` via Orval.
- React + Vite frontend using generated React Query hooks from `lib/api-client-react`.
- PostgreSQL + Drizzle ORM with schema in `lib/db/src/schema/`.
- Cart is persisted in `cart_items` table and requires auth.
- Orders are simplified to one seller per order (the first product's seller).
- Payments recorded as `bKash`, `Nagad`, `Rocket`, or `COD` enum; no external payment SDK in v1.
- Categories are seeded, not user-managed.

**Useful commands:**
- `pnpm --filter @workspace/db run push` after schema changes
- `pnpm --filter @workspace/api-spec run codegen` after OpenAPI spec changes
- `pnpm run typecheck` to verify all packages

**Why:** The generated API client and Zod validators keep the frontend, backend, and OpenAPI spec in sync. Custom JWT keeps the auth setup simple without Clerk/Replit Auth complexity.
