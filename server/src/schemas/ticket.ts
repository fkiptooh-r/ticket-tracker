import { z } from "zod";
import { TicketPriority, TicketStatus } from "../generated/prisma/enums.js";

// New tickets always start as "open"; status changes go through PATCH.
export const createTicketSchema = z.strictObject({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((value) => value || undefined),
  priority: z.enum(TicketPriority).optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

// Query params arrive as strings, so page and limit are coerced to numbers.
export const listTicketsQuerySchema = z.object({
  status: z.enum(TicketStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
