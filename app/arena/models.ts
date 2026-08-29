export type ArenaModel = {
  readonly id: string;
  readonly name: string;
  readonly contextWindow: number;
  readonly pricing: {
    readonly prompt: string;
    readonly completion: string;
  };
};

type OpenRouterModel = {
  readonly id: string;
  readonly name: string;
  readonly context_length: number;
  readonly pricing: {
    readonly prompt: string;
    readonly completion: string;
  };
};

type OpenRouterModelsResponse = {
  readonly data: readonly OpenRouterModel[];
};

// Listed as free-tier by OpenRouter, but reject every plain chat-completion
// request with "only available on agentic harnesses" — permanently unusable
// here, not just flaky, so they're excluded before they can ever be picked.
const AGENTIC_HARNESS_ONLY_MODELS = new Set([
  "thinkingmachines/inkling:free",
  "thinkingmachines/inkling-small:free",
]);

const isFreeModel = (model: OpenRouterModel): boolean =>
  model.id.endsWith(":free") && !AGENTIC_HARNESS_ONLY_MODELS.has(model.id);

export const fetchFreeModels = async (): Promise<readonly ArenaModel[]> => {
  const response = await fetch("https://openrouter.ai/api/v1/models");

  if (!response.ok) {
    throw new Error(
      `OpenRouter models request failed with status ${response.status}`,
    );
  }

  const { data } = (await response.json()) as OpenRouterModelsResponse;

  return data
    .filter(isFreeModel)
    .map((model) => ({
      id: model.id,
      name: model.name,
      contextWindow: model.context_length,
      pricing: model.pricing,
    }))
    .sort((a, b) => b.contextWindow - a.contextWindow);
};
