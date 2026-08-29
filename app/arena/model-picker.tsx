"use client";

import { useEffect, useRef, useState } from "react";
import type { ArenaModel } from "./models";

const MAX_MODELS = 3;

type ModelPickerProps = {
  readonly selected: readonly string[];
  readonly onChange: (modelIds: readonly string[]) => void;
};

export function ModelPicker({ selected, onChange }: ModelPickerProps) {
  const [models, setModels] = useState<readonly ArenaModel[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hasDefaultedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/models")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load models");
        return response.json() as Promise<{ models: readonly ArenaModel[] }>;
      })
      .then(({ models: fetched }) => {
        if (cancelled) return;
        setModels(fetched);
        if (!hasDefaultedRef.current) {
          hasDefaultedRef.current = true;
          onChange(fetched.slice(0, MAX_MODELS).map((model) => model.id));
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopoverOpen]);

  const modelById = new Map((models ?? []).map((model) => [model.id, model]));

  const toggleModel = (modelId: string) => {
    if (selected.includes(modelId)) {
      onChange(selected.filter((id) => id !== modelId));
    } else if (selected.length < MAX_MODELS) {
      onChange([...selected, modelId]);
    }
  };

  const removeModel = (modelId: string) => {
    onChange(selected.filter((id) => id !== modelId));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selected.map((modelId) => (
        <span
          key={modelId}
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-body text-sm text-foreground"
        >
          {modelById.get(modelId)?.name ?? modelId}
          <button
            type="button"
            onClick={() => removeModel(modelId)}
            aria-label={`Remove ${modelById.get(modelId)?.name ?? modelId}`}
            className="text-foreground-muted hover:text-error"
          >
            ×
          </button>
        </span>
      ))}

      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsPopoverOpen((open) => !open)}
          disabled={selected.length >= MAX_MODELS}
          className="rounded-full border border-dashed border-border px-3 py-1 font-body text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add model
        </button>

        {isPopoverOpen && (
          <div className="absolute bottom-full left-0 z-10 mb-2 max-h-72 w-72 overflow-y-auto rounded-md border border-border bg-surface p-2 shadow-lg">
            {loadError && (
              <p className="px-2 py-1 font-body text-sm text-error">
                Couldn&apos;t load models. Please try again.
              </p>
            )}
            {!models && !loadError && (
              <p className="px-2 py-1 font-body text-sm text-foreground-muted">
                Loading models…
              </p>
            )}
            {models?.map((model) => {
              const isSelected = selected.includes(model.id);
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => toggleModel(model.id)}
                  disabled={!isSelected && selected.length >= MAX_MODELS}
                  className="flex w-full flex-col items-start gap-0.5 rounded px-2 py-1.5 text-left font-body text-sm hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex w-full items-center justify-between text-foreground">
                    {model.name}
                    {isSelected && <span className="text-accent">✓</span>}
                  </span>
                  <span className="font-metric text-xs text-foreground-muted">
                    {model.contextWindow.toLocaleString()} ctx
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
