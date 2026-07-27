// Vercel Function. Requests to /api/* are rewritten to this function (see
// vercel.json) while keeping their original path/query in req.url, which
// Express uses to match routes registered under `/api` (see
// artifacts/api-server/src/app.ts).
//
// Built by `pnpm --filter @workspace/api-server run build:serverless` as
// part of the Vercel build command, which produces this file before Vercel
// bundles this function.
// @ts-expect-error - generated at build time, not present until `pnpm --filter @workspace/api-server run build:serverless` runs
import app from "../artifacts/api-server/dist/serverless.mjs";

export default app;
