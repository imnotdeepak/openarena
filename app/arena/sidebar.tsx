"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

type ThreadSummary = {
  readonly id: string;
  readonly name: string;
};

const NAV_LINKS = [
  { href: "/thread/new", label: "Arena" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/models", label: "Models" },
];

export function Sidebar({
  isOpen,
  onToggle,
}: {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}) {
  const pathname = usePathname();
  const [threads, setThreads] = useState<readonly ThreadSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/threads")
      .then(
        (response) =>
          response.json() as Promise<{ threads: readonly ThreadSummary[] }>,
      )
      .then(({ threads: fetched }) => {
        if (!cancelled) setThreads(fetched);
      })
      .catch(() => {
        // Sidebar thread list is a convenience, not critical — fail quiet.
      });

    return () => {
      cancelled = true;
    };
    // Refetch whenever the route changes, so a just-created thread shows up.
  }, [pathname]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open sidebar"
        className="flex h-10 w-10 items-center justify-center border-r border-border bg-surface text-foreground-muted hover:text-accent"
      >
        ▸
      </button>
    );
  }

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-display text-lg font-medium text-foreground"
        >
          OpenArena
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse sidebar"
          className="text-foreground-muted hover:text-accent"
        >
          ◂
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded px-2 py-1.5 font-body text-sm ${
              pathname === link.href
                ? "bg-background text-accent"
                : "text-foreground hover:bg-background"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        <span className="px-2 font-metric text-xs uppercase tracking-wide text-foreground-muted">
          Your threads
        </span>
        <Link
          href="/thread/new"
          className="rounded px-2 py-1.5 font-body text-sm text-accent hover:bg-background"
        >
          + New thread
        </Link>
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/thread/${thread.id}`}
            className={`truncate rounded px-2 py-1.5 font-body text-sm ${
              pathname === `/thread/${thread.id}`
                ? "bg-background text-accent"
                : "text-foreground hover:bg-background"
            }`}
          >
            {thread.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <Show
          when="signed-in"
          fallback={
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-md bg-accent px-3 py-1.5 font-body text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Sign in
              </button>
            </SignInButton>
          }
        >
          <UserButton />
        </Show>
      </div>
    </aside>
  );
}
