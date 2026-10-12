import { getTickets, getTicketStats } from "@/lib/api";
import { isTicketStatus } from "@/lib/types";
import { Pagination } from "./pagination";
import { RetryButton } from "./retry-button";
import { StatusFilter } from "./status-filter";
import { TicketList } from "./ticket-list";

type Props = {
  searchParams: PageProps<"/">["searchParams"];
};

const PAGE_SIZE = 10;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Reads request data, so it renders inside the page's <Suspense> boundary.
export async function TicketsView({ searchParams }: Props) {
  const params = await searchParams;
  const rawStatus = first(params.status);
  const rawPage = Number(first(params.page));

  // Ignore bad URL values rather than surfacing an API 400 to the user.
  const status = isTicketStatus(rawStatus) ? rawStatus : undefined;
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  let result;
  try {
    result = await Promise.all([
      getTickets({ status, page, limit: PAGE_SIZE }),
      getTicketStats(),
    ]);
  } catch {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
      >
        <p>Couldn&apos;t load tickets. Check that the API is running.</p>
        <RetryButton />
      </div>
    );
  }
  const [tickets, stats] = result;

  return (
    <div className="flex flex-col gap-4">
      <StatusFilter active={status} stats={stats} />
      <TicketList tickets={tickets.data} />
      <Pagination
        page={page}
        totalPages={tickets.meta.totalPages}
        status={status}
      />
    </div>
  );
}

export function TicketsViewSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading tickets"
    >
      <div className="h-8 w-80 max-w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
    </div>
  );
}
