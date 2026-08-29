type AnswerLike = {
  readonly id: string;
  readonly model: string;
};

type TurnLike = {
  readonly answers: readonly AnswerLike[];
  readonly vote: { readonly winningAnswerId: string } | null;
};

export type ModelWinRate = {
  readonly model: string;
  readonly wins: number;
  readonly decidedTurns: number;
};

// Per-model record within one thread, matching the sketch's "0/2" chip:
// wins out of turns that were actually decided by a vote and that this
// model participated in — not every turn it was merely selected for.
export const computeWinRates = (
  turns: readonly TurnLike[],
): readonly ModelWinRate[] => {
  const byModel = new Map<string, { wins: number; decidedTurns: number }>();

  turns
    .filter((turn) => turn.vote !== null)
    .forEach((turn) => {
      const winningModel = turn.answers.find(
        (answer) => answer.id === turn.vote?.winningAnswerId,
      )?.model;

      turn.answers.forEach((answer) => {
        const entry = byModel.get(answer.model) ?? {
          wins: 0,
          decidedTurns: 0,
        };
        entry.decidedTurns += 1;
        if (answer.model === winningModel) entry.wins += 1;
        byModel.set(answer.model, entry);
      });
    });

  return Array.from(byModel.entries()).map(([model, record]) => ({
    model,
    ...record,
  }));
};
