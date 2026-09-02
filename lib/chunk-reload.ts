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

function isWithinCooldown(): boolean {
  const last = Number(window.sessionStorage.getItem(RELOAD_MARKER) ?? 0);
  return Date.now() - last < RELOAD_COOLDOWN_MS;
}

// True when a reload is the right response to this error and the cooldown does
// not block it. A boundary reads this during render to show a quiet reloading
// screen; when it is false the boundary must offer a real retry control, so a
// chunk error that keeps failing does not strand the user on a spinner.
export function willReloadForChunkError(error: Error): boolean {
  return (
    typeof window !== "undefined" &&
    isChunkLoadError(error) &&
    !isWithinCooldown()
  );
}

// Reloads the page once for a chunk error. The cooldown stops a reload loop: if
// the reload does not fix the error within the window, this does nothing and the
// boundary falls back to its retry UI instead.
export function reloadOnceForChunkError(error: Error): void {
  if (!willReloadForChunkError(error)) {
    return;
  }

  window.sessionStorage.setItem(RELOAD_MARKER, String(Date.now()));
  window.location.reload();
}
