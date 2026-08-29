import { prisma } from "@/lib/prisma";
import { computeWinRates } from "./win-rates";

export type LeaderboardRow = {
  readonly model: string;
  readonly wins: number;
  readonly decidedTurns: number;
  readonly avgTimeToFirstTokenMs: number | null;
  readonly avgTokensPerSecond: number | null;
};

export type LeaderboardScope = "global" | { readonly userId: string };

const average = (values: readonly number[]): number | null =>
  values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;

export const computeLeaderboard = async (
  scope: LeaderboardScope,
): Promise<readonly LeaderboardRow[]> => {
  const threadFilter =
    scope === "global" ? {} : { thread: { ownerId: scope.userId } };

  const turns = await prisma.turn.findMany({
    where: threadFilter,
    include: {
      answers: {
        select: {
          id: true,
          model: true,
          status: true,
          timeToFirstTokenMs: true,
          tokensPerSecond: true,
        },
      },
      vote: { select: { winningAnswerId: true } },
    },
  });

  const winRates = computeWinRates(turns);

  const speedByModel = new Map<
    string,
    { ttft: number[]; tokensPerSecond: number[] }
  >();

  turns
    .flatMap((turn) => turn.answers)
    .filter((answer) => answer.status === "done")
    .forEach((answer) => {
      const entry = speedByModel.get(answer.model) ?? {
        ttft: [],
        tokensPerSecond: [],
      };
      if (answer.timeToFirstTokenMs != null) {
        entry.ttft.push(answer.timeToFirstTokenMs);
      }
      if (answer.tokensPerSecond != null) {
        entry.tokensPerSecond.push(answer.tokensPerSecond);
      }
      speedByModel.set(answer.model, entry);
    });

  return winRates
    .map((row) => {
      const speed = speedByModel.get(row.model);
      return {
        ...row,
        avgTimeToFirstTokenMs: average(speed?.ttft ?? []),
        avgTokensPerSecond: average(speed?.tokensPerSecond ?? []),
      };
    })
    .sort((a, b) => {
      const winRateA = a.decidedTurns === 0 ? 0 : a.wins / a.decidedTurns;
      const winRateB = b.decidedTurns === 0 ? 0 : b.wins / b.decidedTurns;
      if (winRateB !== winRateA) return winRateB - winRateA;
      return b.decidedTurns - a.decidedTurns;
    });
};
