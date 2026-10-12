import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { createTicketSchema } from "../schemas/ticket.js";

export const ticketsRouter = Router();

ticketsRouter.post("/", async (req, res) => {
  const data = createTicketSchema.parse(req.body);
  const ticket = await prisma.ticket.create({ data });
  res.status(201).json(ticket);
});
