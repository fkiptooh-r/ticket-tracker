import type { Ticket } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "./badges";

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

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
            <h2 className="font-medium break-words">{ticket.title}</h2>
            <div className="flex shrink-0 gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
          {ticket.description && (
            <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {ticket.description}
            </p>
          )}
          <p className="text-xs text-zinc-500">
            #{ticket.id} · opened {dateFormat.format(new Date(ticket.createdAt))}
          </p>
        </li>
      ))}
    </ul>
  );
}
