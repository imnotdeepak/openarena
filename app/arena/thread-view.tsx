"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ModelPicker } from "./model-picker";
import { AnswerCard, type AnswerCardData } from "./answer-card";
import { streamAnswer } from "./stream-answer";
import { computeWinRates } from "./win-rates";
import { WinRateChips } from "./win-rate-chips";

type TurnData = {
  readonly id: string;
  readonly prompt: string;
  readonly answers: readonly AnswerCardData[];
  readonly vote: { readonly winningAnswerId: string } | null;
};

type ThreadViewProps = {
  readonly threadId: string | null;
  readonly threadName: string;
  readonly initialTurns: readonly TurnData[];
  readonly isOwner: boolean;
};

export function ThreadView({
  threadId,
  threadName,
  initialTurns,
  isOwner,
}: ThreadViewProps) {
  const router = useRouter();
  const [selectedModels, setSelectedModels] = useState<readonly string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [turns, setTurns] = useState<readonly TurnData[]>(initialTurns);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const streamedAnswerIds = useRef(new Set<string>());

  const updateAnswer = (
    turnId: string,
    answerId: string,
    patch: Partial<AnswerCardData>,
  ) => {
    setTurns((current) =>
      current.map((turn) =>
        turn.id !== turnId
          ? turn
          : {
              ...turn,
              answers: turn.answers.map((answer) =>
                answer.id === answerId ? { ...answer, ...patch } : answer,
              ),
            },
      ),
    );
  };

  const startStreamsForTurn = (turn: TurnData) => {
    turn.answers
      .filter((answer) => answer.status === "pending")
      .forEach((answer) => {
        if (streamedAnswerIds.current.has(answer.id)) return;
        streamedAnswerIds.current.add(answer.id);

        updateAnswer(turn.id, answer.id, { status: "streaming" });

        streamAnswer(answer.id, {
          onTextChange: (text) =>
            updateAnswer(turn.id, answer.id, { content: text }),
          onDone: () => updateAnswer(turn.id, answer.id, { status: "done" }),
          onFailed: (reconciled) =>
            updateAnswer(
              turn.id,
              answer.id,
              reconciled ?? {
                status: "failed",
                errorMessage: "This model failed to answer.",
              },
            ),
        });
      });
  };

  useEffect(() => {
    turns.forEach(startStreamsForTurn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPrompt = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setFormError("Enter a prompt first.");
      return;
    }
    if (selectedModels.length === 0) {
      setFormError("Select at least one model.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      let currentThreadId = threadId;

      if (!currentThreadId) {
        const threadResponse = await fetch("/api/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedPrompt.slice(0, 60) }),
        });
        if (!threadResponse.ok) {
          const payload = (await threadResponse.json()) as { error?: string };
          throw new Error(payload.error ?? "Could not create thread.");
        }
        const { thread } = (await threadResponse.json()) as {
          thread: { id: string };
        };
        currentThreadId = thread.id;
      }

      const turnResponse = await fetch(
        `/api/threads/${currentThreadId}/turns`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmedPrompt,
            models: selectedModels,
          }),
        },
      );

      const turnPayload = (await turnResponse.json()) as {
        turn?: TurnData;
        error?: string;
      };

      if (!turnResponse.ok || !turnPayload.turn) {
        throw new Error(turnPayload.error ?? "Could not send prompt.");
      }

      setPrompt("");

      if (!threadId) {
        router.push(`/thread/${currentThreadId}`);
        return;
      }

      const newTurn = { ...turnPayload.turn, vote: null };
      setTurns((current) => [...current, newTurn]);
      startStreamsForTurn(newTurn);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const castVote = async (turnId: string, answerId: string) => {
    const response = await fetch(`/api/turns/${turnId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setFormError(payload.error ?? "Could not cast vote.");
      return;
    }

    setTurns((current) =>
      current.map((turn) =>
        turn.id === turnId
          ? { ...turn, vote: { winningAnswerId: answerId } }
          : turn,
      ),
    );
  };

  const winRates = useMemo(() => computeWinRates(turns), [turns]);

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-6 py-3">
        <span className="font-body text-sm text-foreground-muted">
          Arena / {threadName}
        </span>
        <WinRateChips winRates={winRates} />
      </div>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-10">
        {turns.map((turn) => {
          const doneCount = turn.answers.filter(
            (a) => a.status === "done",
          ).length;
          const canVote = isOwner && !turn.vote && doneCount >= 2;

          return (
            <div
              key={turn.id}
              className="mx-auto flex w-full max-w-5xl flex-col gap-4"
            >
              <p className="self-end rounded-md bg-surface px-4 py-2 font-body text-sm text-foreground">
                {turn.prompt}
              </p>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${turn.answers.length}, minmax(0, 1fr))`,
                }}
              >
                {turn.answers.map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    isWinner={turn.vote?.winningAnswerId === answer.id}
                    canVote={canVote}
                    onVote={() => castVote(turn.id, answer.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isOwner ? (
        <div className="border-t border-border bg-surface px-6 py-4">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
            <ModelPicker
              selected={selectedModels}
              onChange={setSelectedModels}
            />
            <div className="flex items-end gap-2">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitPrompt();
                  }
                }}
                placeholder="Ask anything. Enter to send, shift + enter for a new line"
                rows={2}
                className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-foreground-muted"
              />
              <button
                type="button"
                onClick={submitPrompt}
                disabled={isSubmitting}
                className="rounded-md bg-accent px-4 py-2 font-body text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                ↑
              </button>
            </div>
            {formError && (
              <p className="font-body text-sm text-error">{formError}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="border-t border-border bg-surface px-6 py-4 text-center">
          <p className="font-body text-sm text-foreground-muted">
            You&apos;re viewing someone else&apos;s thread. Only the owner can
            send prompts and vote here.
          </p>
        </div>
      )}
    </div>
  );
}
