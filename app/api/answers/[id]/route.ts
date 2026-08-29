import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const answer = await prisma.answer.findUnique({ where: { id } });

  if (!answer) {
    return Response.json({ error: "Answer not found." }, { status: 404 });
  }

  return Response.json({ answer });
}
