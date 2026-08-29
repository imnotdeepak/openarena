import { prisma } from "@/lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";
import { requireUser } from "@/app/arena/require-user";

type CastVoteBody = {
  readonly answerId?: unknown;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id: turnId } = await params;

  const turn = await prisma.turn.findUnique({
    where: { id: turnId },
    include: { thread: true },
  });
  if (!turn) {
    return Response.json({ error: "Turn not found." }, { status: 404 });
  }
  if (turn.thread.ownerId !== auth.userId) {
    return Response.json({ error: "This isn't your thread." }, { status: 403 });
  }

  const body = (await request.json()) as CastVoteBody;
  const answerId = typeof body.answerId === "string" ? body.answerId : "";

  if (!answerId) {
    return Response.json(
      { error: "Request must include answerId." },
      { status: 400 },
    );
  }

  const [existingVote, doneAnswerCount, winningAnswer] = await Promise.all([
    prisma.vote.findUnique({ where: { turnId } }),
    prisma.answer.count({ where: { turnId, status: "done" } }),
    prisma.answer.findFirst({
      where: { id: answerId, turnId, status: "done" },
    }),
  ]);

  if (existingVote) {
    return Response.json(
      { error: "This turn already has a vote." },
      { status: 409 },
    );
  }

  if (doneAnswerCount < 2) {
    return Response.json(
      {
        error:
          "At least two models need to finish answering before you can vote.",
      },
      { status: 400 },
    );
  }

  if (!winningAnswer) {
    return Response.json(
      { error: "That answer isn't a valid, finished answer on this turn." },
      { status: 400 },
    );
  }

  const vote = await prisma.vote.create({
    data: {
      turnId,
      winningAnswerId: answerId,
      voterId: auth.userId,
    },
  });

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: auth.userId,
    event: "arena_vote_cast",
    properties: {
      turnId,
      winningAnswerId: answerId,
      model: winningAnswer.model,
    },
  });
  await posthog.flush();

  return Response.json({ vote });
}
