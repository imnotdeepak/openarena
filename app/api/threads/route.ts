import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/app/arena/require-user";

type CreateThreadBody = {
  readonly name?: unknown;
};

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ threads: [] });
  }

  const threads = await prisma.thread.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true },
  });

  return Response.json({ threads });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as CreateThreadBody;
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : "Untitled thread";

  const thread = await prisma.thread.create({
    data: {
      name,
      ownerId: auth.userId,
    },
  });

  return Response.json({ thread });
}
