import type { ModelMessage } from "ai";
import { prisma } from "@/lib/prisma";

// Each model's follow-up sees only its own prior answers, never a rival's
// (feature 3's decision) — built here from the database so a client can
// never construct the wrong history, by mistake or otherwise.
export const buildModelContext = async (
  turnId: string,
  model: string,
): Promise<readonly ModelMessage[]> => {
  const turn = await prisma.turn.findUniqueOrThrow({
    where: { id: turnId },
  });

  const priorTurns = await prisma.turn.findMany({
    where: {
      threadId: turn.threadId,
      createdAt: { lte: turn.createdAt },
    },
    orderBy: { createdAt: "asc" },
    include: {
      answers: {
        where: { model, status: "done" },
      },
    },
  });

  return priorTurns.flatMap((t): readonly ModelMessage[] => {
    const priorAnswer = t.answers[0];
    const userMessage: ModelMessage = { role: "user", content: t.prompt };

    if (!priorAnswer?.content) {
      return [userMessage];
    }

    return [userMessage, { role: "assistant", content: priorAnswer.content }];
  });
};
