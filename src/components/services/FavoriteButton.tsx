"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api/types";
import { useIsSignedIn } from "@/lib/useHydrated";
import { useFavoritesStore } from "@/store/favorites.store";

// "Favorite" toggle — 48px, white heart glyph on a filled square: deep green
// on the compare header (Figma 3320:9628), orange on the detail page
// (3337:166097); saved = red fill.
//
// Saved state is the account's real favourites list (POST/DELETE
// /favorites/{providerId}, via favorites.store). Signed-out visitors are sent
// through the site's phone sign-in first and land back on this page.
export function FavoriteButton({
  providerId,
  providerName,
  tone,
}: {
  providerId: string;
  providerName: string;
  tone: "secondary" | "tertiary";
}) {
  const router = useRouter();
  const signedIn = useIsSignedIn();
  const saved = useFavoritesStore((s) => s.ids.includes(providerId));
  const busy = useFavoritesStore((s) => s.pending.includes(providerId));
  const load = useFavoritesStore((s) => s.load);
  const toggle = useFavoritesStore((s) => s.toggle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signedIn) void load();
  }, [signedIn, load]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  function onClick() {
    if (signedIn === false) {
      const here = `${window.location.pathname}${window.location.search}`;
      router.push(`/verify-phone?next=${encodeURIComponent(here)}`);
      return;
    }
    setError(null);
    toggle(providerId).catch((err) => setError(`Couldn't update saved providers. ${getErrorMessage(err)}`));
  }

  const isSaved = signedIn === true && saved;
  const fill = isSaved ? "bg-error" : tone === "secondary" ? "bg-secondary" : "bg-tertiary";

  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-pressed={signedIn ? isSaved : undefined}
        aria-label={
          signedIn === false
            ? `Sign in to save ${providerName}`
            : isSaved
              ? `Remove ${providerName} from saved`
              : `Save ${providerName}`
        }
        title={signedIn === false ? "Sign in to save providers" : undefined}
        disabled={signedIn === null || busy}
        onClick={onClick}
        className={`flex size-12 items-center justify-center rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait ${fill}`}
      >
        <Image src="/icons/services/heart-white.svg" alt="" width={18} height={16} />
      </button>
      <span
        role="status"
        className={`absolute top-full right-0 z-10 mt-2 w-64 rounded-card bg-bg-base px-3 py-2 text-[14px] leading-5 text-error shadow-[0_6px_12px_rgba(0,0,0,0.15)] ${
          error ? "" : "sr-only"
        }`}
      >
        {error}
      </span>
    </span>
  );
}

export default FavoriteButton;
