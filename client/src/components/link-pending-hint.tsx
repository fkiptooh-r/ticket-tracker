"use client";

import { useLinkStatus } from "next/link";

// Filter and page links fetch fresh data, so show a hint while navigation is pending.
// Always rendered at a fixed size and faded in, to avoid layout shift.
export function LinkPendingHint() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={`size-3 rounded-full border-2 border-current border-t-transparent transition-opacity ${
        pending ? "animate-spin opacity-70" : "opacity-0"
      }`}
    />
  );
}
