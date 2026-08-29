import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

const STEPS = [
  {
    number: "01",
    title: "Pick up to three models",
    body: "Choose from OpenRouter's live free-tier catalog, sorted by context window. Defaults to three, swap any of them out.",
  },
  {
    number: "02",
    title: "Send one prompt",
    body: "Every selected model answers at once, streaming independently — one being slow or down never blocks the others.",
  },
  {
    number: "03",
    title: "Vote for the real winner",
    body: "Once two or more models have answered, pick the best one. That's one real vote, feeding an honest leaderboard.",
  },
];

const HONEST_NUMBERS = [
  {
    label: "Time to first token",
    body: "Measured in the response itself, not estimated — the real wall-clock gap before the first word arrives.",
  },
  {
    label: "Tokens per second",
    body: "Computed from real output and real duration for every answer, every time.",
  },
  {
    label: "Cost: $0.0000",
    body: "Every model here is free tier. That's not a bug or a rounding error — it's shown because it's true.",
  },
];

export default function Home() {
  return (
    <div className="flex h-screen flex-1 snap-y snap-mandatory flex-col overflow-y-auto bg-background">
      <section className="flex h-screen shrink-0 snap-start flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <span className="font-display text-lg font-medium text-foreground">
            OpenArena
          </span>
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
        </header>

        <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6 sm:items-center sm:text-center">
          <div className="flex w-full max-w-3xl flex-col items-start gap-8 sm:items-center">
            <span className="font-metric text-base tracking-wide text-foreground-muted">
              OPENARENA
            </span>
            <h1 className="font-display text-6xl font-medium leading-[1.05] text-foreground sm:text-7xl">
              Send one prompt.
              <br />
              Watch three models answer.
              <br />
              Vote for the real winner.
            </h1>
            <p className="max-w-xl font-body text-xl leading-relaxed text-foreground-muted">
              Real votes and real per-call numbers, time to first token, tokens
              per second, total tokens, build an honest leaderboard of which
              model is actually worth using.
            </p>
            <Link
              href="/thread/new"
              className="mt-2 rounded-md bg-accent px-6 py-3 font-body text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start a thread
            </Link>
          </div>
        </div>
      </section>

      <section className="flex h-screen shrink-0 snap-start flex-col justify-center border-t border-border bg-surface px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <h2 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
            How it works
          </h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col gap-3">
                <span className="font-metric text-base text-accent">
                  {step.number}
                </span>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="font-body text-lg leading-relaxed text-foreground-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex h-screen shrink-0 snap-start flex-col justify-center border-t border-border px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
              Real numbers, not vibes
            </h2>
            <p className="max-w-3xl font-body text-xl leading-relaxed text-foreground-muted">
              Most model comparisons are anecdotal. OpenArena keeps the actual
              measurements next to every answer, and the leaderboard is built
              from real head-to-head votes, never a made-up score.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {HONEST_NUMBERS.map((item) => (
              <div key={item.label} className="flex flex-col gap-3">
                <span className="font-metric text-lg font-medium text-foreground">
                  {item.label}
                </span>
                <p className="font-body text-lg leading-relaxed text-foreground-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex h-screen shrink-0 snap-start flex-col justify-center border-t border-border bg-surface px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
          <h2 className="font-display text-4xl font-medium text-foreground sm:text-5xl">
            See who&apos;s actually winning
          </h2>
          <p className="max-w-xl font-body text-xl leading-relaxed text-foreground-muted">
            Browse the live leaderboard, or the full free-model catalog, before
            you start your own thread.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/thread/new"
              className="rounded-md bg-accent px-6 py-3 font-body text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start a thread
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-md border border-border px-6 py-3 font-body text-base font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              View leaderboard
            </Link>
            <Link
              href="/models"
              className="rounded-md border border-border px-6 py-3 font-body text-base font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Browse models
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
