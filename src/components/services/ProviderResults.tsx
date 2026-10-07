"use client";

import Image from "next/image";
import Link from "next/link";
import { useIsSignedIn } from "@/lib/useHydrated";
import { Pagination } from "./Pagination";
import { ProviderCard } from "./ProviderCard";
import { FREE_PROVIDER_COUNT, PROVIDERS } from "./data";

// Figma nodes 3316:43575 "Right Side" (Sorted By + Services List) and
// 3318:89008 "Unlock Pop Up" — a signed-out visitor sees the first
// FREE_PROVIDER_COUNT cards clearly, the rest blurred behind a gate asking
// for mobile+OTP verification. A signed-in user (phone already verified)
// never sees the gate. TODO: swap PROVIDERS for a real providers API.
export function ProviderResults() {
  const signedIn = useIsSignedIn();
  // Until auth hydrates (signedIn === null) keep the tail blurred but don't
  // show the popup, so neither audience sees a one-frame flash of the other's UI.
  const locked = signedIn !== true;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex w-full items-center justify-end gap-4">
        <p className="text-[24px] leading-8 font-semibold text-primary uppercase">Sort by</p>
        <button
          type="button"
          className="flex h-12 w-[319px] items-center justify-between rounded-input border-[1.5px] border-border-hairline bg-bg-base py-3.5 pr-3 pl-4"
        >
          <span className="text-[18px] leading-7 text-text-tertiary">Budget- Friendly</span>
          <Image src="/icons/homepage/explore-sort-chevron.svg" alt="" width={16} height={16} aria-hidden />
        </button>
      </div>

      <div className="relative grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        {PROVIDERS.map((provider, i) => {
          const gated = locked && i >= FREE_PROVIDER_COUNT;
          return (
            <div
              key={provider.id}
              aria-hidden={gated || undefined}
              inert={gated || undefined}
              className={gated ? "pointer-events-none blur-sm select-none" : ""}
            >
              <ProviderCard provider={provider} />
            </div>
          );
        })}

        {signedIn === false && (
          <div className="pointer-events-auto absolute top-[26%] left-1/2 w-[400px] max-w-[90%] -translate-x-1/2">
            <div className="flex w-full flex-col items-center gap-5 rounded-card bg-bg-layout p-6 shadow-[0_6px_12px_rgba(0,0,0,0.15)]">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-[24px] leading-8 font-semibold text-text-primary">View Providers</p>
                <p className="text-[18px] leading-7 text-text-secondary">
                  Enter your mobile number and OTP to unlock more providers.
                </p>
              </div>
              <Link
                href="/verify-phone?next=/services"
                className="flex h-[50px] w-full items-center justify-center rounded-control bg-primary text-[18px] font-medium text-white transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Unlock All Providers
              </Link>
            </div>
          </div>
        )}
      </div>

      <Pagination />
    </div>
  );
}

export default ProviderResults;
