"use client";

import Image from "next/image";
import { useState } from "react";

// "Favorite" toggle — 48px, white heart glyph on a filled square: deep green
// on the compare header (Figma 3320:9628), orange on the detail page
// (3337:166097). TODO: persist once a favourites API exists; local only now.
export function FavoriteButton({
  providerName,
  tone,
}: {
  providerName: string;
  tone: "secondary" | "tertiary";
}) {
  const [saved, setSaved] = useState(false);
  const fill = saved ? "bg-error" : tone === "secondary" ? "bg-secondary" : "bg-tertiary";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${providerName} from saved` : `Save ${providerName}`}
      onClick={() => setSaved((v) => !v)}
      className={`flex size-12 shrink-0 items-center justify-center rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${fill}`}
    >
      <Image src="/icons/services/heart-white.svg" alt="" width={18} height={16} />
    </button>
  );
}

export default FavoriteButton;
