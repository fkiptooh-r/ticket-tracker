// Mirrors the API's enums and response shapes.
export const TICKET_STATUSES = ["open", "in_progress", "closed"] as const;
export const TICKET_PRIORITIES = ["low", "medium", "high"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export type Ticket = {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
};

export type TicketPage = {
  data: Ticket[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type TicketStats = {
  byStatus: Record<TicketStatus, number>;
  total: number;
};

export function isTicketStatus(value: unknown): value is TicketStatus {
  return TICKET_STATUSES.includes(value as TicketStatus);
}
