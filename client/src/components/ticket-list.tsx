import type { Ticket } from "@/lib/types";
import { PriorityBadge } from "./badges";
import { TicketStatusSelect } from "./ticket-status-select";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
        No tickets here yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="flex flex-col gap-2 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-medium wrap-break-word">{ticket.title}</h3>
            <div className="flex shrink-0 items-start gap-2">
              <PriorityBadge priority={ticket.priority} />
              <TicketStatusSelect
                ticketId={ticket.id}
                ticketTitle={ticket.title}
                status={ticket.status}
              />
            </div>
          </div>
          {ticket.description && (
            <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {ticket.description}
            </p>
          )}
          <p className="text-xs text-zinc-500">
            #{ticket.id} · opened{" "}
            {dateFormat.format(new Date(ticket.createdAt))}
          </p>
        </li>
      ))}
    </ul>
  );
}
