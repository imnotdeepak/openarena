import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ThreadView } from "@/app/arena/thread-view";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      turns: {
        orderBy: { createdAt: "asc" },
        include: { answers: true, vote: true },
      },
    },
  });

  if (!thread) {
    notFound();
  }

  return (
    <ThreadView
      threadId={thread.id}
      threadName={thread.name}
      initialTurns={thread.turns}
      isOwner={userId === thread.ownerId}
    />
  );
}
