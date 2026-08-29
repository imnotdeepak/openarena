import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      turns: {
        orderBy: { createdAt: "asc" },
        include: {
          answers: true,
          vote: true,
        },
      },
    },
  });

  if (!thread) {
    return Response.json({ error: "Thread not found." }, { status: 404 });
  }

  return Response.json({ thread });
}
