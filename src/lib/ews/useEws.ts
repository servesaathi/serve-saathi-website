"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsSignedIn } from "@/lib/useHydrated";
import useAuthStore from "@/store/auth.store";
import { getInProgress, listHistory, type Assessment } from "./ewsService";

export type EwsState =
  | { status: "loading" }
  | { status: "signed_out" }
  | {
      status: "ready";
      userId: string;
      /** Most recent completed check-in — drives empty state vs dashboard. */
      latest: Assessment | null;
      /** Unfinished check-in that can be resumed. */
      draft: Assessment | null;
      /** Completed check-ins, newest first. */
      history: Assessment[];
    };

type Loaded = { userId: string; version: number; draft: Assessment | null; history: Assessment[] };

/** The signed-in user's EWS data, reloadable after a check-in changes it. */
export function useEws(): EwsState & { refresh: () => void } {
  const signedIn = useIsSignedIn();
  const userId = useAuthStore((s) => (s.user ? String(s.user.id) : null));
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!signedIn || !userId) return;
    let cancelled = false;
    Promise.all([listHistory(userId), getInProgress(userId)]).then(([history, draft]) => {
      if (!cancelled) setLoaded({ userId, version, draft, history });
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn, userId, version]);

  if (signedIn === null) return { status: "loading", refresh };
  if (!signedIn || !userId) return { status: "signed_out", refresh };
  // Stale data for another user (or before the first load) counts as loading.
  if (!loaded || loaded.userId !== userId) return { status: "loading", refresh };
  return {
    status: "ready",
    userId,
    latest: loaded.history[0] ?? null,
    draft: loaded.draft,
    history: loaded.history,
    refresh,
  };
}
