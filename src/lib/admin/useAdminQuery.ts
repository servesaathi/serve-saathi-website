"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { getErrorMessage } from "@/lib/api/types";

/**
 * Minimal fetch-on-key hook for the admin screens. Re-fetches whenever `key`
 * changes (e.g. page/search/filter) or `reload()` is called. While a new
 * request is in flight the previous `data` stays on screen (`loading` is
 * true), so tables don't flash empty between pages.
 */
export function useAdminQuery<T>(key: string, fetcher: () => Promise<T>) {
  const [nonce, setNonce] = useState(0);
  const requestKey = `${key}#${nonce}`;
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: "" });

  const run = useEffectEvent(() => fetcher());

  useEffect(() => {
    let alive = true;
    run().then(
      (data) => alive && setState({ key: requestKey, data }),
      (err) => alive && setState((s) => ({ key: requestKey, data: s.data, error: getErrorMessage(err) }))
    );
    return () => {
      alive = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const loading = state.key !== requestKey;

  return { data: state.data, error: loading ? undefined : state.error, loading, reload };
}
