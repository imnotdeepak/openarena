"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunk-reload";

export default function Error({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    reloadOnceForChunkError(error);
  }, [error]);

  // A chunk error self-heals with a reload, so keep the screen quiet until the
  // page comes back rather than flashing an error message.
  if (isChunkLoadError(error)) {
    return (
      <div className="flex h-screen flex-1 items-center justify-center bg-background">
        <span className="font-metric text-sm tracking-wide text-foreground-muted">
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-1 flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <h1 className="font-display text-4xl font-medium text-foreground">
        Something went wrong
      </h1>
      <p className="max-w-md font-body text-lg leading-relaxed text-foreground-muted">
        An unexpected error stopped this page from loading. Try again — it is
        often a passing glitch.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-accent px-6 py-3 font-body text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
