// Entry point for serverless platforms (Vercel Functions). Unlike src/index.ts,
// this does NOT call app.listen() — the platform invokes the exported handler
// directly for each request instead of running a long-lived server process.
import app from "./app";

export default app;
