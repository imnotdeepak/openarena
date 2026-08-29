import type { ModelWinRate } from "./win-rates";

export function WinRateChips({
  winRates,
}: {
  readonly winRates: readonly ModelWinRate[];
}) {
  if (winRates.length === 0) return null;

  return (
    <div className="ml-auto flex gap-2">
      {winRates.map(({ model, wins, decidedTurns }) => (
        <span
          key={model}
          title={model}
          className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-metric text-xs text-foreground-muted"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-background text-[10px] text-foreground">
            {model.split("/").pop()?.[0]?.toUpperCase() ?? "?"}
          </span>
          {wins}/{decidedTurns}
        </span>
      ))}
    </div>
  );
}
