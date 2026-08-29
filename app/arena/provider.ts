import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { openRouterApiKey } from "./env";

export const openrouter = createOpenRouter({
  apiKey: openRouterApiKey,
});
