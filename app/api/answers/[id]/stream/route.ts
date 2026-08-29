import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";
import { openrouter } from "@/app/arena/provider";
import { buildModelContext } from "@/app/arena/context";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: answerId } = await params;

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { turn: { include: { thread: true } } },
  });

  if (!answer) {
    return Response.json({ error: "Answer not found." }, { status: 404 });
  }

  if (answer.status !== "pending") {
    return Response.json(
      { error: "This answer has already started or finished." },
      { status: 409 },
    );
  }

  await prisma.answer.update({
    where: { id: answerId },
    data: { status: "streaming" },
  });

  const messages = await buildModelContext(answer.turnId, answer.model);

  const startedAt = performance.now();
  let firstTokenAt: number | undefined;

  const result = streamText({
    model: openrouter(answer.model),
    messages: [...messages],
    timeout: 30_000,
    onChunk: ({ chunk }) => {
      if (chunk.type === "text-delta" && firstTokenAt === undefined) {
        firstTokenAt = performance.now();
      }
    },
    onEnd: async ({ text, usage }) => {
      const durationSeconds = (performance.now() - startedAt) / 1000;
      const outputTokens = usage.outputTokens ?? 0;

      await prisma.answer.update({
        where: { id: answerId },
        data: {
          status: "done",
          content: text,
          timeToFirstTokenMs: firstTokenAt
            ? Math.round(firstTokenAt - startedAt)
            : null,
          tokensPerSecond:
            durationSeconds > 0 ? outputTokens / durationSeconds : null,
          totalTokens: usage.totalTokens ?? null,
        },
      });

      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: answer.turn.thread.ownerId,
        event: "arena_answer_finished",
        properties: {
          answerId,
          model: answer.model,
          totalTokens: usage.totalTokens,
        },
      });
      await posthog.flush();
    },
    onError: async ({ error }) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown provider error.";

      console.error(`Answer ${answerId} (${answer.model}) failed:`, error);

      await prisma.answer.update({
        where: { id: answerId },
        data: { status: "failed", errorMessage },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
