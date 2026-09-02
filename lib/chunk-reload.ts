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

// sessionStorage throws on any access when a browser blocks it (sandboxed
// iframe, strict privacy settings). We need it to guard against a reload loop,
// so probe once and treat a blocked store as "cannot reload" — never let the
// probe throw out of the error boundary that is meant to be the last defense.
let storageWorks: boolean | undefined;
function canUseStorage(): boolean {
  if (storageWorks === undefined) {
    try {
      const probe = "openarena:storage-probe";
      window.sessionStorage.setItem(probe, "1");
      window.sessionStorage.removeItem(probe);
      storageWorks = true;
    } catch {
      storageWorks = false;
    }
  }
  return storageWorks;
}

function isWithinCooldown(): boolean {
  const last = Number(window.sessionStorage.getItem(RELOAD_MARKER) ?? 0);
  return Date.now() - last < RELOAD_COOLDOWN_MS;
}

// True when a reload is the right response to this error and nothing blocks it:
// a chunk error, a usable store, and the cooldown clear. A boundary reads this
// during render to show a quiet reloading screen; when it is false the boundary
// must offer a real retry control, so a chunk error that keeps failing — or a
// blocked store — does not strand the user on a spinner.
export function willReloadForChunkError(error: Error): boolean {
  return (
    typeof window !== "undefined" &&
    isChunkLoadError(error) &&
    canUseStorage() &&
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
