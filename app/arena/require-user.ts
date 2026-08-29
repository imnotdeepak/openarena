import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type RequireUserResult =
  | { readonly ok: true; readonly userId: string }
  | { readonly ok: false; readonly response: Response };

// Every write (sending a prompt, voting) needs a real signed-in user.
// auth.protect() returns a 404 for unauthenticated API requests, which
// reads as a broken route rather than an auth wall — check userId directly
// instead, so a signed-out request gets a plain, honest 401.
export const requireUser = async (): Promise<RequireUserResult> => {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      response: Response.json(
        { error: "Sign in to do that." },
        { status: 401 },
      ),
    };
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  return { ok: true, userId };
};
