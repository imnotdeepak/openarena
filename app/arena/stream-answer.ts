import {
  parseJsonEventStream,
  readUIMessageStream,
  uiMessageChunkSchema,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import type { AnswerCardData } from "./answer-card";

const STREAM_TIMEOUT_MS = 45_000;

export type StreamAnswerCallbacks = {
  readonly onTextChange: (text: string) => void;
  readonly onDone: () => void;
  readonly onFailed: (answer?: AnswerCardData) => void;
};

const toChunkStream = (
  body: ReadableStream<Uint8Array>,
): ReadableStream<UIMessageChunk> =>
  parseJsonEventStream({
    stream: body,
    schema: uiMessageChunkSchema,
  }).pipeThrough(
    new TransformStream({
      transform(result, controller) {
        if (result.success) {
          controller.enqueue(result.value);
        }
      },
    }),
  );

const textFromMessage = (message: UIMessage): string =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

// The stream can hang without ever erroring on the wire (an upstream model
// that times out silently) — if nothing arrives within the timeout, fall
// back to asking the server what the Answer's real, persisted status is,
// rather than leaving the UI stuck showing "Thinking..." forever.
const reconcileFromServer = async (
  answerId: string,
): Promise<AnswerCardData | undefined> => {
  try {
    const response = await fetch(`/api/answers/${answerId}`);
    if (!response.ok) return undefined;
    const { answer } = (await response.json()) as { answer: AnswerCardData };
    return answer;
  } catch {
    return undefined;
  }
};

export const streamAnswer = async (
  answerId: string,
  { onTextChange, onDone, onFailed }: StreamAnswerCallbacks,
): Promise<void> => {
  let settled = false;

  const timeoutId = setTimeout(async () => {
    if (settled) return;
    settled = true;
    onFailed(await reconcileFromServer(answerId));
  }, STREAM_TIMEOUT_MS);

  try {
    const response = await fetch(`/api/answers/${answerId}/stream`, {
      method: "POST",
    });

    if (!response.ok || !response.body) {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        onFailed(await reconcileFromServer(answerId));
      }
      return;
    }

    const stream = readUIMessageStream({
      stream: toChunkStream(response.body),
      // An in-band `error` chunk (the model call failed after the HTTP
      // response already started, e.g. rejected by the provider) doesn't
      // close the stream by itself — without this, the for-await loop below
      // never exits and the UI hangs on "Thinking..." forever.
      onError: () => {},
      terminateOnError: true,
    });

    for await (const message of stream) {
      if (settled) return;
      onTextChange(textFromMessage(message));
    }

    if (!settled) {
      settled = true;
      clearTimeout(timeoutId);
      onDone();
    }
  } catch (error) {
    if (!settled) {
      settled = true;
      clearTimeout(timeoutId);
      console.error(`Streaming answer ${answerId} failed:`, error);
      onFailed(await reconcileFromServer(answerId));
    }
  }
};
