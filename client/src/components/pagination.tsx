import Link from "next/link";
import { LinkPendingHint } from "./link-pending-hint";
import type { TicketStatus } from "@/lib/types";

type Props = {
  page: number;
  totalPages: number;
  status?: TicketStatus;
};

function pageHref(page: number, status?: TicketStatus) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `/?${search}` : "/";
}

const linkClass =
  "inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";
const disabledClass =
  "rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600";

export function Pagination({ page, totalPages, status }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link href={pageHref(page - 1, status)} className={linkClass}>
          <LinkPendingHint />
          Previous
        </Link>
      ) : (
        <span className={disabledClass}>Previous</span>
      )}
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageHref(page + 1, status)} className={linkClass}>
          Next
          <LinkPendingHint />
        </Link>
      ) : (
        <span className={disabledClass}>Next</span>
      )}
    </nav>
  );
}
