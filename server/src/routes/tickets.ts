import { Router } from "express";
import { TicketStatus } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamsSchema,
  updateTicketSchema,
} from "../schemas/ticket.js";

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

// Registered before any "/:id" GET route so "stats" is never read as an id.
ticketsRouter.get("/stats", async (_req, res) => {
  const groups = await prisma.ticket.groupBy({ by: ["status"], _count: { _all: true } });

  // groupBy omits statuses with no tickets, so start every status at zero.
  const byStatus = Object.fromEntries(
    Object.values(TicketStatus).map((status) => [status, 0]),
  ) as Record<TicketStatus, number>;
  for (const group of groups) {
    byStatus[group.status] = group._count._all;
  }

  const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
  res.json({ byStatus, total });
});

ticketsRouter.patch("/:id", async (req, res) => {
  const { id } = ticketIdParamsSchema.parse(req.params);
  const data = updateTicketSchema.parse(req.body);
  const ticket = await prisma.ticket.update({ where: { id }, data });
  res.json(ticket);
});
