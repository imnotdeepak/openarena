"use client";

import { useEffect, useState } from "react";
import type { LeaderboardRow } from "@/app/arena/leaderboard";

type Scope = "global" | "personal";

export function LeaderboardView() {
  const [scope, setScope] = useState<Scope>("global");
  const [rows, setRows] = useState<readonly LeaderboardRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/leaderboard?scope=${scope}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          rows?: readonly LeaderboardRow[];
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !payload.rows) {
          setError(payload.error ?? "Could not load the leaderboard.");
          setRows([]);
          return;
        }
        setError(null);
        setRows(payload.rows);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the leaderboard.");
      });

    return () => {
      cancelled = true;
    };
  }, [scope]);

  return (
    <div className="flex flex-1 flex-col gap-6 bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="font-display text-3xl font-medium text-foreground">
          Leaderboard
        </h1>
        <p className="mt-2 font-body text-base text-foreground-muted">
          Every model&apos;s real record, from actual head-to-head votes.
        </p>

        <div className="mt-6 inline-flex rounded-md border border-border p-1">
          {(["global", "personal"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setScope(option)}
              className={`rounded px-3 py-1 font-body text-sm capitalize ${
                scope === option
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 font-body text-sm text-error">{error}</p>}

        {!error && rows.length === 0 && (
          <p className="mt-6 font-body text-sm text-foreground-muted">
            No decided votes yet.
          </p>
        )}

        {rows.length > 0 && (
          <table className="mt-6 w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left font-body text-sm text-foreground-muted">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Model</th>
                <th className="py-2 pr-4">Win Rate</th>
                <th className="py-2 pr-4">Avg. to first token</th>
                <th className="py-2">Avg. tokens/sec</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const winRate =
                  row.decidedTurns === 0 ? 0 : row.wins / row.decidedTurns;
                const isFirstPlace = index === 0;

                return (
                  <tr
                    key={row.model}
                    className={`border-b border-border font-body text-sm ${
                      isFirstPlace ? "bg-surface" : ""
                    }`}
                  >
                    <td className="py-3 pr-4 text-foreground-muted">
                      {index + 1}
                    </td>
                    <td className="py-3 pr-4 text-foreground">{row.model}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-metric text-lg font-semibold text-accent">
                          Won {row.wins} of {row.decidedTurns}
                        </span>
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${winRate * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-metric text-xs text-foreground-muted">
                      {row.avgTimeToFirstTokenMs != null
                        ? `${Math.round(row.avgTimeToFirstTokenMs)}ms`
                        : "—"}
                    </td>
                    <td className="py-3 font-metric text-xs text-foreground-muted">
                      {row.avgTokensPerSecond != null
                        ? `${row.avgTokensPerSecond.toFixed(1)} tok/s`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
