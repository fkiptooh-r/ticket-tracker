import { PRIORITY_LABELS, type TicketPriority } from "@/lib/types";

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-white text-zinc-600 ring-zinc-300 dark:bg-transparent dark:text-zinc-400 dark:ring-zinc-600",
  medium:
    "bg-white text-indigo-700 ring-indigo-300 dark:bg-transparent dark:text-indigo-300 dark:ring-indigo-500/50",
  high: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/30",
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityStyles[priority]}`}
    >
      {PRIORITY_LABELS[priority]} priority
    </span>
  );
}
