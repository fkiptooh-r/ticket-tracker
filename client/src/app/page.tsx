import { Suspense } from "react";
import { CreateTicketForm } from "@/components/create-ticket-form";
import { TicketsView, TicketsViewSkeleton } from "@/components/tickets-view";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mini Ticket Tracker
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Track and triage support tickets.
        </p>
      </header>
      <CreateTicketForm />
      <section aria-labelledby="tickets-heading" className="flex flex-col gap-4">
        <h2 id="tickets-heading" className="font-medium">
          Tickets
        </h2>
        <Suspense fallback={<TicketsViewSkeleton />}>
          <TicketsView searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}
