import type {
  Ticket,
  TicketPage,
  TicketPriority,
  TicketStats,
  TicketStatus,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: FieldError[],
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      body?.error ?? `Request failed (${res.status})`,
      res.status,
      body?.details,
    );
  }
  return body as T;
}

function sendJson<T>(method: string, path: string, data: unknown) {
  return request<T>(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function getTickets(params: {
  status?: TicketStatus;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  return request<TicketPage>(`/tickets?${query}`);
}

export function getTicketStats() {
  return request<TicketStats>("/tickets/stats");
}

export function createTicket(input: {
  title: string;
  description?: string;
  priority: TicketPriority;
}) {
  return sendJson<Ticket>("POST", "/tickets", input);
}

export function updateTicket(
  id: number,
  changes: { status?: TicketStatus; priority?: TicketPriority },
) {
  return sendJson<Ticket>("PATCH", `/tickets/${id}`, changes);
}
