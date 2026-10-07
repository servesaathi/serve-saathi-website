"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { useIsSignedIn } from "@/lib/useHydrated";
import { useCompareStore } from "@/store/compare.store";
import { FavoriteButton } from "./FavoriteButton";
import { RatingStars } from "./RatingStars";
import { PLACEHOLDER_PHOTO, directionsUrl, type Provider } from "./data";

// "02b_Homepage / Explore Service - Compare Detail Lock" (Figma 3318:96619)
// and "... Compare Detail UnLock" (3337:165440). Signed-out visitors see the
// organisation header cards but the comparison rows are blurred behind the
// "Compare All Providers Side-by-Side" prompt; a signed-in user (phone
// verified via OTP) sees every row.

type Row = { label?: string; values: string[]; kind?: "stars"; stars?: number[] };
type Section = { title?: string; rows: Row[] };

function pad(list: string[], length: number, filler: string): string[] {
  return [...list, ...Array(Math.max(0, length - list.length)).fill(filler)];
}

/** One row per list item, padded so every column has the same number of rows. */
function listRows(lists: string[][], filler: string): Row[] {
  const length = Math.max(1, ...lists.map((l) => l.length));
  const padded = lists.map((l) => pad(l, length, filler));
  return Array.from({ length }, (_, i) => ({ values: padded.map((list) => list[i]) }));
}

// Rows are limited to what GET /services/providers/{id}/profile actually
// returns — the Figma frame's "Founded / Mission / Impact Ratings" rows have
// no backend field, so they're replaced with Experience / Location / Visits.
function buildSections(providers: Provider[]): Section[] {
  const col = <T,>(fn: (p: Provider) => T) => providers.map(fn);

  return [
    { rows: [{ label: "Price", values: col((p) => p.startingPrice ?? "Not listed") }] },
    {
      title: "Identity",
      rows: [
        { label: "Experience", values: col((p) => p.experience ?? "-") },
        { label: "Location", values: col((p) => p.location) },
        { label: "Categories", values: col((p) => p.categories.join(", ") || "-") },
      ],
    },
    {
      title: "Ratings and Review",
      rows: [
        {
          label: "Ratings",
          values: col((p) => (p.reviewCount > 0 ? `${p.rating} (${p.reviewCount})` : "No ratings yet")),
          kind: "stars",
          stars: col((p) => Math.round(p.rating)),
        },
        { label: "Visits done", values: col((p) => p.visits ?? "-") },
      ],
    },
    { title: "Programs & Initiatives", rows: listRows(col((p) => p.programs), "-") },
    {
      title: "Services Provided",
      rows: listRows(
        col((p) => p.services.map((s) => (s.price ? `${s.name} — ${s.price}` : s.name))),
        "-",
      ),
    },
  ];
}

const CELL = "border-r border-b border-border-hairline";

function OrganizationHeader({ provider, onRemove }: { provider: Provider; onRemove: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center gap-4 bg-white pt-4">
      <div className="relative h-[120px] w-[150px]">
        <Image src={PLACEHOLDER_PHOTO} alt="" fill sizes="150px" className="object-cover" />
      </div>
      <div className={`flex w-full flex-1 flex-col gap-4 bg-bg-base px-6 pt-4 pb-6 ${CELL}`}>
        <h2 className="text-[24px] leading-8 font-semibold text-primary">{provider.name}</h2>
        <p className="flex-1 text-[18px] leading-7 text-text-secondary">{provider.address}</p>
        <a
          href={directionsUrl(provider.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 self-start rounded-control pr-4 text-[18px] leading-7 font-semibold text-tertiary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Image src="/icons/services/directions.svg" alt="" width={24} height={24} />
          Get Directions
        </a>
        <div className="flex w-full items-start gap-4">
          <Link
            href={`/services/${provider.id}`}
            className="flex h-12 flex-1 items-center justify-center rounded-control bg-primary px-4 text-[18px] leading-7 font-semibold text-white transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            See Details
          </Link>
          <FavoriteButton providerId={provider.id} providerName={provider.name} tone="secondary" />
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${provider.name} from comparison`}
        className="absolute top-4 right-6 flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Image src="/icons/services/close-circle.svg" alt="" width={24} height={24} />
      </button>
    </div>
  );
}

export function CompareTable({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const signedIn = useIsSignedIn();
  const removeFromStore = useCompareStore((s) => s.remove);
  const locked = signedIn !== true;

  function remove(id: string) {
    removeFromStore(id);
    const rest = providers.filter((p) => p.id !== id).map((p) => p.id);
    router.replace(rest.length ? `/services/compare?ids=${rest.join(",")}` : "/services");
  }

  const sections = buildSections(providers);
  const cols = providers.length;
  const unlockHref = `/verify-phone?next=${encodeURIComponent(`/services/compare?ids=${providers.map((p) => p.id).join(",")}`)}`;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-[720px] flex-col">
        <div className="grid items-stretch" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {providers.map((p) => (
            <OrganizationHeader key={p.id} provider={p} onRemove={() => remove(p.id)} />
          ))}
        </div>

        <div className="relative">
          <table
            aria-hidden={locked || undefined}
            inert={locked || undefined}
            className={`w-full table-fixed border-collapse text-left ${locked ? "blur-[4px] select-none" : ""}`}
          >
            <caption className="sr-only">
              Side-by-side comparison of {providers.map((p) => p.name).join(", ")}
            </caption>
            <thead className="sr-only">
              <tr>
                {providers.map((p) => (
                  <th key={p.id} scope="col">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((section, si) => (
                <Fragment key={si}>
                  {section.title && (
                    <tr>
                      <th
                        colSpan={cols}
                        scope="colgroup"
                        className="border-r border-b border-tertiary bg-tertiary px-4 py-2 text-[18px] leading-6 font-semibold text-white"
                      >
                        {section.title}
                      </th>
                    </tr>
                  )}
                  {section.rows.map((row, ri) => (
                    <Fragment key={ri}>
                      {row.label && (
                        <tr>
                          {providers.map((p, ci) => (
                            <th
                              key={p.id}
                              scope="col"
                              className={`bg-bg-layout py-1 font-semibold text-text-secondary ${CELL} ${
                                section.title ? "px-2 text-[16px] leading-[22px]" : "px-4 text-[18px] leading-7"
                              }`}
                            >
                              {ci === 0 ? row.label : <span className="sr-only">{row.label}</span>}
                            </th>
                          ))}
                        </tr>
                      )}
                      <tr>
                        {row.values.map((value, ci) => (
                          <td
                            key={providers[ci].id}
                            className={`bg-bg-base px-4 py-1 text-[16px] leading-[22px] text-text-muted ${CELL}`}
                          >
                            {row.kind === "stars" ? (
                              <div className="flex flex-col gap-1">
                                <RatingStars count={row.stars?.[ci] ?? 0} />
                                <span className="text-[18px] leading-7 font-semibold text-primary">{value}</span>
                              </div>
                            ) : (
                              value || "\u00a0"
                            )}
                          </td>
                        ))}
                      </tr>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>

          {signedIn === false && (
            <div className="absolute inset-0 flex items-start justify-center px-4 pt-[72px]">
              <div className="flex w-[432px] max-w-full flex-col items-center gap-4 rounded-card bg-bg-layout p-6 text-center shadow-[0_6px_12px_rgba(0,0,0,0.15)]">
                <p className="text-[24px] leading-8 font-semibold text-text-primary">
                  Compare All Providers
                  <br />
                  Side-by-Side
                </p>
                <p className="text-[18px] leading-7 text-text-secondary">
                  See full specifications, hidden fees, and performance ratings for all available options.
                </p>
                <Link
                  href={unlockHref}
                  className="flex h-[50px] w-full items-center justify-center rounded-control bg-primary text-[18px] font-semibold text-white transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  View Full Comparison
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompareTable;
