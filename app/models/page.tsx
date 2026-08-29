import { fetchFreeModels } from "@/app/arena/models";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await fetchFreeModels();

  return (
    <div className="flex flex-1 flex-col gap-6 bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="font-display text-3xl font-medium text-foreground">
          Models
        </h1>
        <p className="mt-2 font-body text-base text-foreground-muted">
          Every free-tier model currently available on OpenRouter.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4"
            >
              <span className="font-body text-sm font-medium text-foreground">
                {model.name}
              </span>
              <span className="font-metric text-xs text-foreground-muted">
                {model.contextWindow.toLocaleString()} token context
              </span>
              <span className="font-metric text-xs text-foreground-muted">
                ${model.pricing.prompt} / ${model.pricing.completion} per token
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
