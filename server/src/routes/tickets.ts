import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { createTicketSchema, listTicketsQuerySchema } from "../schemas/ticket.js";

export const ticketsRouter = Router();

ticketsRouter.post("/", async (req, res) => {
  const data = createTicketSchema.parse(req.body);
  const ticket = await prisma.ticket.create({ data });
  res.status(201).json(ticket);
});

ticketsRouter.get("/", async (req, res) => {
  const { status, page, limit } = listTicketsQuerySchema.parse(req.query);
  const where = status ? { status } : {};

  // Not a $transaction: its 2s start budget is easily exceeded while a suspended
  // Neon compute wakes up. The page and count may differ by a concurrent write.
  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      // id breaks ties so pages stay stable when timestamps match.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({
    data: tickets,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
