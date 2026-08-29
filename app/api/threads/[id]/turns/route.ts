import { prisma } from "@/lib/prisma";
import { getPostHogClient } from "@/lib/posthog-server";
import { promptInjectionCheck } from "@/app/arena/arcjet";
import { fetchFreeModels } from "@/app/arena/models";
import { requireUser } from "@/app/arena/require-user";

const MAX_MODELS_PER_TURN = 3;

type CreateTurnBody = {
  readonly prompt?: unknown;
  readonly models?: unknown;
};

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id: threadId } = await params;

  const thread = await prisma.thread.findUnique({ where: { id: threadId } });
  if (!thread) {
    return Response.json({ error: "Thread not found." }, { status: 404 });
  }
  if (thread.ownerId !== auth.userId) {
    return Response.json({ error: "This isn't your thread." }, { status: 403 });
  }

  const body = (await request.json()) as CreateTurnBody;
  const posthog = getPostHogClient();

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const models = isStringArray(body.models) ? body.models : [];

  if (!prompt || models.length === 0 || models.length > MAX_MODELS_PER_TURN) {
    posthog.capture({
      distinctId: auth.userId,
      event: "arena_invalid_request",
      properties: {
        reason: !prompt ? "missing_prompt" : "invalid_model_count",
        modelCount: models.length,
      },
    });
    await posthog.flush();
    return Response.json(
      {
        error: `Request must include a prompt and 1-${MAX_MODELS_PER_TURN} models.`,
      },
      { status: 400 },
    );
  }

  const decision = await promptInjectionCheck.protect(request, {
    detectPromptInjectionMessage: prompt,
  });

  if (decision.isDenied()) {
    const status = decision.reason.isRateLimit() ? 429 : 403;
    const message = decision.reason.isPromptInjection()
      ? "That message looks like it's trying to manipulate the model. Please rephrase."
      : "Too many requests. Please slow down and try again.";
    return Response.json({ error: message }, { status });
  }

  const freeModels = await fetchFreeModels();
  const validModelIds = new Set(freeModels.map((model) => model.id));
  const invalidModels = models.filter((model) => !validModelIds.has(model));

  if (invalidModels.length > 0) {
    return Response.json(
      { error: `Unknown or unavailable model(s): ${invalidModels.join(", ")}` },
      { status: 400 },
    );
  }

  const turn = await prisma.turn.create({
    data: {
      threadId,
      prompt,
      answers: {
        create: models.map((model) => ({ model })),
      },
    },
    include: { answers: true },
  });

  posthog.capture({
    distinctId: auth.userId,
    event: "arena_message_sent",
    properties: { models, threadId, turnId: turn.id },
  });
  await posthog.flush();

  return Response.json({ turn });
}
