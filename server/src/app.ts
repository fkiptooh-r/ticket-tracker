import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middleware/errors.js";
import { ticketsRouter } from "./routes/tickets.js";

// Builds the Express app without binding a port, so tests can import it directly.
export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/tickets", ticketsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
