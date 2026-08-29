import arcjet, {
  detectBot,
  detectPromptInjection,
  shield,
  slidingWindow,
} from "@arcjet/next";
import { arcjetKey } from "./env";

export const aj = arcjet({
  key: arcjetKey,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: [] }),
    slidingWindow({ mode: "LIVE", interval: 60, max: 20 }),
  ],
});

export const promptInjectionCheck = aj.withRule(
  detectPromptInjection({ mode: "LIVE" }),
);
