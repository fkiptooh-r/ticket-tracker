"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { updateTicket } from "@/lib/api";
import {
  STATUS_LABELS,
  TICKET_STATUSES,
  isTicketStatus,
  type TicketStatus,
} from "@/lib/types";

const statusStyles: Record<TicketStatus, string> = {
  open: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300",
  in_progress:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300",
  closed:
    "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

type Props = {
  ticketId: number;
  ticketTitle: string;
  status: TicketStatus;
};

export function TicketStatusSelect({ ticketId, ticketTitle, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Shows the new status immediately; falls back to the server value if the update fails.
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [error, setError] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isTicketStatus(next)) return;

    setError(false);
    startTransition(async () => {
      setOptimisticStatus(next);
      try {
        await updateTicket(ticketId, { status: next });
        router.refresh();
      } catch {
        setError(true);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={optimisticStatus}
        onChange={handleChange}
        disabled={isPending}
        aria-label={`Status of "${ticketTitle}"`}
        className={`rounded-full border px-3 py-1.5 text-sm font-medium sm:px-2 sm:py-0.5 sm:text-xs disabled:opacity-60 ${statusStyles[optimisticStatus]}`}
      >
        {TICKET_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          Update failed
        </p>
      )}
    </div>
  );
}
