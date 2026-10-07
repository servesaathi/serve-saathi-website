import { useSyncExternalStore } from "react";
import useAuthStore from "@/store/auth.store";

const subscribe = () => () => {};

/**
 * False during SSR and the first client render, true afterwards. The persisted
 * zustand stores read localStorage/sessionStorage synchronously on the client,
 * so anything rendered from them must wait for this to avoid a hydration
 * mismatch against the server HTML (which always sees empty storage).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

/**
 * Whether a signed-in user is present. `null` until hydrated, so callers can
 * avoid flashing the signed-out UI (e.g. the "Unlock providers" gate) at a
 * signed-in user for one frame.
 */
export function useIsSignedIn(): boolean | null {
  const hydrated = useHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated && Boolean(s.token));
  return hydrated ? isAuthenticated : null;
}
