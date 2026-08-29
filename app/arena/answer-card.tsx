"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type AnswerCardData = {
  readonly id: string;
  readonly model: string;
  readonly status: "pending" | "streaming" | "done" | "failed";
  readonly content: string | null;
  readonly errorMessage?: string | null;
  readonly timeToFirstTokenMs?: number | null;
  readonly tokensPerSecond?: number | null;
  readonly totalTokens?: number | null;
};

type AnswerCardProps = {
  readonly answer: AnswerCardData;
  readonly isWinner: boolean;
  readonly canVote: boolean;
  readonly onVote?: () => void;
};

export function AnswerCard({
  answer,
  isWinner,
  canVote,
  onVote,
}: AnswerCardProps) {
  return (
    <div
      className={`flex flex-col rounded-md border bg-surface p-4 ${
        isWinner ? "border-winner" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
        <span className="truncate font-body text-sm font-medium text-foreground">
          {answer.model}
        </span>
        {isWinner ? (
          <span className="flex-shrink-0 rounded-full bg-winner px-2 py-0.5 font-metric text-xs text-winner-foreground">
            Winner
          </span>
        ) : (
          canVote &&
          answer.status === "done" && (
            <button
              type="button"
              onClick={onVote}
              className="flex-shrink-0 whitespace-nowrap rounded-full border border-accent px-2 py-0.5 font-body text-xs text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Pick this one
            </button>
          )
        )}
      </div>

      <div className="min-h-16 py-3 font-body text-sm leading-relaxed text-foreground">
        {answer.status === "pending" && (
          <span className="text-foreground-muted">Waiting to start…</span>
        )}
        {answer.status === "failed" && (
          <span className="text-error">
            {answer.errorMessage ?? "This model failed to answer."}
          </span>
        )}
        {(answer.status === "streaming" || answer.status === "done") &&
          (answer.content ? (
            <div className="answer-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {answer.content}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="text-foreground-muted">Thinking…</span>
          ))}
      </div>

      {answer.status === "done" && (
        <div className="flex gap-3 border-t border-border pt-2 font-metric text-xs text-foreground-muted">
          {answer.timeToFirstTokenMs != null && (
            <span>{answer.timeToFirstTokenMs}ms TTFT</span>
          )}
          {answer.tokensPerSecond != null && (
            <span>{answer.tokensPerSecond.toFixed(1)} tok/s</span>
          )}
          {answer.totalTokens != null && (
            <span>{answer.totalTokens} tokens</span>
          )}
        </div>
      )}
    </div>
  );
}
