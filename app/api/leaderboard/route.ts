import { auth } from "@clerk/nextjs/server";
import { computeLeaderboard } from "@/app/arena/leaderboard";

export async function GET(request: Request) {
  const scopeParam = new URL(request.url).searchParams.get("scope");

  if (scopeParam === "personal") {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: "Sign in to see your personal leaderboard." },
        { status: 401 },
      );
    }
    const rows = await computeLeaderboard({ userId });
    return Response.json({ rows });
  }

  const rows = await computeLeaderboard("global");
  return Response.json({ rows });
}
