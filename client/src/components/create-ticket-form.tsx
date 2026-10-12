"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ApiError, createTicket, type FieldError } from "@/lib/api";
import {
  PRIORITY_LABELS,
  TICKET_PRIORITIES,
  type TicketPriority,
} from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-xs outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900";

export function CreateTicketForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<number | null>(null);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setFieldErrors([]);
    setFormError(null);
    setCreated(null);

    startTransition(async () => {
      try {
        const ticket = await createTicket({
          title: String(data.get("title")),
          description: String(data.get("description")) || undefined,
          priority: data.get("priority") as TicketPriority,
        });
        form.reset();
        setCreated(ticket.id);
        router.refresh();
      } catch (error) {
        if (error instanceof ApiError && error.details) {
          setFieldErrors(error.details);
        } else {
          setFormError("Couldn't create the ticket. Please try again.");
        }
      }
    });
  }

  const errorFor = (field: string) =>
    fieldErrors.find((error) => error.field === field)?.message;
  const titleError = errorFor("title");

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="font-medium">New ticket</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "title-error" : undefined}
          className={inputClass}
        />
        {titleError && (
          <p id="title-error" className="text-sm text-red-600">
            {titleError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description{" "}
          <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={5000}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            className={inputClass}
          >
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? "Creating…" : "Create ticket"}
        </button>
      </div>

      <p aria-live="polite" className="text-sm empty:hidden">
        {formError && <span className="text-red-600">{formError}</span>}
        {created && (
          <span className="text-green-700 dark:text-green-400">
            Ticket #{created} created.
          </span>
        )}
      </p>
    </form>
  );
}
