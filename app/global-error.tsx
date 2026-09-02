"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunk-reload";

// The root catch-all. It also covers errors from the root layout — where
// ClerkProvider wraps the whole tree — which the segment boundary cannot reach.
// It replaces the document, so it styles itself inline rather than relying on
// the app stylesheet.
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    reloadOnceForChunkError(error);
  }, [error]);

  const quiet = isChunkLoadError(error);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "0 1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0f0f0f",
          color: "#ededed",
        }}
      >
        {quiet ? (
          <span style={{ opacity: 0.6 }}>Loading…</span>
        ) : (
          <>
            <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>
              Something went wrong
            </h1>
            <p style={{ maxWidth: "28rem", opacity: 0.7, lineHeight: 1.6 }}>
              An unexpected error stopped the page from loading. Try again — it
              is often a passing glitch.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: "pointer",
                borderRadius: "0.375rem",
                border: "none",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
          </>
        )}
      </body>
    </html>
  );
}
