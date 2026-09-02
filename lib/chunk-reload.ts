// Lazily loaded JavaScript chunks can fail to arrive when a CDN times out or a
// new deploy removes the old chunk. React then throws and the render dies. A
// single reload almost always fixes a transient timeout, so error boundaries
// call this to self-heal instead of stranding the user on a blank page.

const RELOAD_MARKER = "openarena:last-chunk-reload";
const RELOAD_COOLDOWN_MS = 10_000;

// Covers both bundlers: webpack names the error "ChunkLoadError" and phrases it
// "Loading chunk … failed", while Turbopack and native ESM reject a dynamic
// import with "Failed to fetch dynamically imported module".
const CHUNK_ERROR_MESSAGE =
  /Loading (chunk|CSS chunk)|dynamically imported module/i;

export function isChunkLoadError(error: Error): boolean {
  return (
    error.name === "ChunkLoadError" || CHUNK_ERROR_MESSAGE.test(error.message)
  );
}

// Reloads the page once for a chunk error and returns true when it does. The
// cooldown stops a reload loop: if the reload does not fix the error within the
// window, the boundary keeps its fallback visible instead of reloading again.
export function reloadOnceForChunkError(error: Error): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) {
    return false;
  }

  const last = Number(window.sessionStorage.getItem(RELOAD_MARKER) ?? 0);
  if (Date.now() - last < RELOAD_COOLDOWN_MS) {
    return false;
  }

  window.sessionStorage.setItem(RELOAD_MARKER, String(Date.now()));
  window.location.reload();
  return true;
}
