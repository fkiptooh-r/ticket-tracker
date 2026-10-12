import { z } from "zod";
import { TicketPriority } from "../generated/prisma/enums.js";

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
