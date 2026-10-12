import express from "express";

// Builds the Express app without binding a port, so tests can import it directly.
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
