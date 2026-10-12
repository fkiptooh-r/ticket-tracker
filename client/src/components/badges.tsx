import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/types";

const base =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset";

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/30",
  in_progress:
    "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30",
  closed:
    "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/30",
};

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-white text-zinc-600 ring-zinc-300 dark:bg-transparent dark:text-zinc-400 dark:ring-zinc-600",
  medium:
    "bg-white text-indigo-700 ring-indigo-300 dark:bg-transparent dark:text-indigo-300 dark:ring-indigo-500/50",
  high: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/30",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`${base} ${statusStyles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`${base} ${priorityStyles[priority]}`}>
      {PRIORITY_LABELS[priority]} priority
    </span>
  );
}
