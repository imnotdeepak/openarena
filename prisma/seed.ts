import { config } from "dotenv";

config({ path: ".env.local" });

const main = async (): Promise<void> => {
  const { prisma } = await import("../lib/prisma");

  const user = await prisma.user.create({
    data: { id: "seed_user_1" },
  });

  const thread = await prisma.thread.create({
    data: {
      name: "Which model explains recursion best?",
      ownerId: user.id,
    },
  });

  const turn = await prisma.turn.create({
    data: {
      prompt: "Explain recursion in one paragraph.",
      threadId: thread.id,
    },
  });

  const [answerA, answerB] = await Promise.all([
    prisma.answer.create({
      data: {
        turnId: turn.id,
        model: "minimax/minimax-m3:free",
        status: "done",
        content:
          "Recursion is when a function calls itself to solve smaller instances of the same problem, until it reaches a base case simple enough to answer directly.",
        timeToFirstTokenMs: 420,
        tokensPerSecond: 38.5,
        totalTokens: 42,
      },
    }),
    prisma.answer.create({
      data: {
        turnId: turn.id,
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        status: "done",
        content:
          "A recursive function solves a problem by breaking it into smaller versions of itself, calling itself with each smaller version, and stopping at a base case.",
        timeToFirstTokenMs: 610,
        tokensPerSecond: 29.1,
        totalTokens: 39,
      },
    }),
    prisma.answer.create({
      data: {
        turnId: turn.id,
        model: "poolside/laguna-s-2.1:free",
        status: "failed",
        errorMessage: "Upstream provider timed out.",
      },
    }),
  ]);

  await prisma.vote.create({
    data: {
      turnId: turn.id,
      winningAnswerId: answerA.id,
      voterId: user.id,
    },
  });

  console.log(`Seeded thread "${thread.name}" with 3 answers and 1 vote.`);
  console.log(
    `(answerB id: ${answerB.id} — not the winner, seeded for realism)`,
  );

  await prisma.$disconnect();
};

main().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
