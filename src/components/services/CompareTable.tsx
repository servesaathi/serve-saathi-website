"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { useIsSignedIn } from "@/lib/useHydrated";
import { useCompareStore } from "@/store/compare.store";
import { FavoriteButton } from "./FavoriteButton";
import { RatingStars } from "./RatingStars";
import { directionsUrl, type Provider } from "./data";

// "02b_Homepage / Explore Service - Compare Detail Lock" (Figma 3318:96619)
// and "... Compare Detail UnLock" (3337:165440). Signed-out visitors see the
// organisation header cards but the comparison rows are blurred behind the
// "Compare All Providers Side-by-Side" prompt; a signed-in user (phone
// verified via OTP) sees every row.

type Row = { label?: string; values: string[]; kind?: "stars" };
type Section = { title?: string; rows: Row[] };

function pad(list: string[], length: number, filler: string): string[] {
  return [...list, ...Array(Math.max(0, length - list.length)).fill(filler)];
}

function buildSections(providers: Provider[]): Section[] {
  const col = <T,>(fn: (p: Provider) => T) => providers.map(fn);
  const programRows = Math.max(...col((p) => p.programs.length));
  const serviceRows = Math.max(...col((p) => p.services.length));
  const programs = col((p) => pad(p.programs, programRows, ""));
  const services = col((p) => pad(p.services, serviceRows, "-"));

  return [
    { rows: [{ label: "Price", values: col((p) => p.price) }] },
    {
      title: "Identity & Mission",
      rows: [
        { label: "Founded", values: col((p) => p.founded) },
        { label: "Mission", values: col((p) => p.mission) },
      ],
    },
    {
      title: "Ratings and Review",
      rows: [
        { label: "Ratings", values: col((p) => `${p.rating} (${p.reviewCount})`), kind: "stars" },
        { label: "Impact Ratings", values: col((p) => p.impact[0] ?? "-") },
        { values: col((p) => p.impact[1] ?? "-") },
      ],
    },
    {
      title: "Programs & Initiatives",
      rows: Array.from({ length: programRows }, (_, i) => ({ values: programs.map((list) => list[i]) })),
    },
    {
      title: "Services Provided",
      rows: Array.from({ length: serviceRows }, (_, i) => ({ values: services.map((list) => list[i]) })),
    },
  ];
}

const CELL = "border-r border-b border-border-hairline";

function OrganizationHeader({ provider, onRemove }: { provider: Provider; onRemove: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center gap-4 pt-4" style={{ background: provider.logoBackground ?? "white" }}>
      <div className="relative h-[120px] w-[150px]">
        <Image
          src={provider.logo ?? "/images/services/provider-photo-1.jpg"}
          alt={`${provider.name} logo`}
          fill
          sizes="150px"
          className={provider.logo ? "object-contain" : "object-cover"}
        />
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
          <FavoriteButton providerName={provider.name} tone="secondary" />
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
                                <RatingStars count={4} />
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
