import Link from "next/link";
import {
  STATUS_LABELS,
  TICKET_STATUSES,
  type TicketStats,
  type TicketStatus,
} from "@/lib/types";

type Props = {
  active?: TicketStatus;
  stats: TicketStats;
};

// Filter state lives in the URL, so filtered views can be bookmarked and shared.
export function StatusFilter({ active, stats }: Props) {
  const options = [
    { label: "All", href: "/", count: stats.total, isActive: !active },
    ...TICKET_STATUSES.map((status) => ({
      label: STATUS_LABELS[status],
      href: `/?status=${status}`,
      count: stats.byStatus[status],
      isActive: active === status,
    })),
  ];

  return (
    <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Link
          key={option.label}
          href={option.href}
          aria-current={option.isActive ? "page" : undefined}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
            option.isActive
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {option.label}
          <span className="tabular-nums opacity-70">{option.count}</span>
        </Link>
      ))}
    </nav>
  );
}
