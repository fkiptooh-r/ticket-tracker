"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="rounded-md border border-current px-3 py-1 text-sm font-medium disabled:opacity-60"
    >
      {isPending ? "Retrying…" : "Try again"}
    </button>
  );
}
