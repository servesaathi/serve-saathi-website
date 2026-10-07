"use client";

import Image from "next/image";
import Link from "next/link";
import { CompareToggle } from "./CompareToggle";
import type { Provider } from "./data";

// Figma node 3316:43598 "Provider Card" (named "Compare Pop Up Card" in its
// component definition).
export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="relative flex w-full flex-col items-start">
      <div className="relative h-[120px] w-full overflow-hidden rounded-t-card bg-border-card">
        <Image
          src="/images/services/provider-photo-1.jpg"
          alt=""
          fill
          sizes="360px"
          className="object-cover"
        />
      </div>

      <div className="flex w-full flex-col gap-6 rounded-b-card bg-bg-base px-4 py-3">
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full flex-col gap-0.5">
            <div className="flex w-full items-start gap-6">
              <div className="flex flex-1 items-start gap-1">
                <p className="text-[18px] leading-7 font-semibold text-text-secondary">{provider.name}</p>
                <Image src="/icons/homepage/explore-verified-badge.svg" alt="" width={12} height={12} aria-hidden />
              </div>
              <div className="flex h-6 shrink-0 items-center gap-1 rounded-full bg-orange-line px-2">
                <Image src="/icons/homepage/explore-star.svg" alt="" width={16} height={16} aria-hidden />
                <p className="text-[14px] leading-5 text-[#cc5e19]">{provider.rating}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Image src="/icons/homepage/explore-card-pin.svg" alt="" width={20} height={20} aria-hidden />
              <p className="text-[18px] leading-7 text-text-tertiary">{provider.location}</p>
              <span className="text-[20px] leading-5 font-bold text-primary-pressed">&middot;</span>
              <p className="text-[18px] leading-7 text-text-tertiary">{provider.areaOrDistance}</p>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2 px-2">
            {provider.tags.map((tag) => (
              <span key={tag} className="rounded-card bg-bg-layout px-3 py-1 text-[12px] leading-5 text-secondary">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <CompareToggle providerId={provider.id} labelClassName="text-text-tertiary" />
          <Link
            href={`/services/${provider.id}`}
            className="flex h-8 items-center rounded-control bg-primary px-4 text-[14px] leading-5 text-white transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            See details
          </Link>
        </div>
      </div>

      {provider.badge && (
        <Image
          src="/icons/homepage/explore-card-badge.svg"
          alt=""
          width={32}
          height={40}
          aria-hidden
          className="absolute top-0 right-4"
        />
      )}
    </div>
  );
}

export default ProviderCard;
