"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { CompareToggle } from "./CompareToggle";
import { FavoriteButton } from "./FavoriteButton";
import { RatingStars } from "./RatingStars";
import { AVAILABILITY, FAQS, REVIEWS, directionsUrl, type Provider } from "./data";

// "02c_Homepage / Explore Service - Service Detail (About)" — Figma
// 3337:163900 — and "(Review)" — 3337:166010. The design's third CTA,
// "Book", is intentionally gone: ServeSaathi is a discovery platform, so the
// only actions are "Request a Callback" (handed to the provider) and "Visit
// Website" (the provider's own site).

const GALLERY = ["/images/services/provider-hero.jpg", "/images/services/provider-photo-1.jpg"];

type Tab = "about" | "review";

function SectionTitle({ children, as: Tag = "h2" }: { children: ReactNode; as?: "h2" | "h3" }) {
  return <Tag className="text-[24px] leading-8 font-semibold text-text-primary">{children}</Tag>;
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <li className="flex min-h-10 items-center justify-center rounded-card bg-bg-base px-4 py-1.5 text-center text-[16px] leading-[22px] text-text-tertiary">
      {children}
    </li>
  );
}

function AboutTab({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <SectionTitle>About the facility</SectionTitle>
        <p className="text-[18px] leading-7 text-text-secondary">{provider.about}</p>
        <div className="pt-3 text-[18px] leading-7 text-text-secondary">
          <p className="font-semibold text-text-primary">Key facts:</p>
          <ul className="list-disc pl-6">
            {provider.keyFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Programs &amp; Initiatives</SectionTitle>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {provider.initiatives.map((item, i) => (
            <Chip key={`${item}-${i}`}>{item}</Chip>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Services Provided</SectionTitle>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {provider.servicesOffered.map((item, i) => (
            <Chip key={`${item}-${i}`}>{item}</Chip>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Recognitions &amp; Accreditations</SectionTitle>
        <ul className="flex flex-col gap-3">
          {provider.recognitions.map((item) => (
            <li key={item} className="rounded-card bg-bg-base px-4 py-2 text-[16px] leading-[22px] text-text-tertiary">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Pricing</SectionTitle>
        <p className="rounded-card bg-bg-base px-4 py-3 text-[16px] leading-[22px] whitespace-pre-line text-text-tertiary">
          {provider.pricing}
        </p>
        <p className="text-[14px] leading-5 text-text-tertiary">
          Prices are indicative and set by the provider — confirm them directly when they call you back.
        </p>
      </section>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-4 bg-bg-base px-4 py-2 text-left text-[18px] leading-7 font-semibold text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          open ? "rounded-t-card" : "rounded-card"
        }`}
      >
        {question}
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full p-1 ${open ? "bg-secondary" : "bg-primary"}`}
        >
          <Image src={open ? "/icons/services/faq-minus.svg" : "/icons/services/faq-plus.svg"} alt="" width={20} height={20} />
        </span>
      </button>
      {open && (
        <p className="rounded-b-card border-t border-border-hairline bg-bg-base px-4 pt-2 pb-3 text-[18px] leading-7 text-text-tertiary">
          {answer}
        </p>
      )}
    </li>
  );
}

function ReviewTab({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <SectionTitle>Availability this week</SectionTitle>
        <dl className="flex flex-col gap-3 text-[18px] leading-7">
          {AVAILABILITY.map(({ day, hours }) => (
            <div key={day} className="flex items-center justify-between">
              <dt className="text-text-secondary">{day}</dt>
              <dd className={hours ? "text-text-secondary" : "text-tertiary"}>{hours ?? "Not available"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle>Recent Feedback</SectionTitle>
        <ul className="flex flex-col gap-4">
          {REVIEWS.map((r) => (
            <li key={r.name} className="flex flex-col gap-3 rounded-card bg-bg-base p-4">
              <div className="flex items-start gap-2">
                <Image src={r.avatar} alt="" width={40} height={40} className="size-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[18px] leading-7 font-semibold text-text-secondary">{r.name}</p>
                    <p className="text-right text-[16px] leading-5 text-text-muted">{r.date}</p>
                  </div>
                  <RatingStars count={r.stars} />
                </div>
              </div>
              <p className="text-[18px] leading-7 text-text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle>FAQ</SectionTitle>
        <ul className="flex flex-col gap-4">
          {FAQS.map((f) => (
            <FaqItem key={f.question} {...f} />
          ))}
        </ul>
      </section>

      {(provider.phone || provider.email) && (
        <section className="flex flex-col gap-3">
          <h2 className="text-center text-[24px] leading-8 font-semibold text-text-primary">Contact Information</h2>
          <div className="flex flex-col gap-3 text-[18px] leading-7 text-text-secondary sm:flex-row sm:gap-20">
            {provider.phone && (
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Image src="/icons/services/phone.svg" alt="" width={24} height={24} />
                  Phone
                </span>
                <a href={`tel:${provider.phone.replace(/\s/g, "")}`} className="hover:underline">
                  {provider.phone}
                </a>
              </div>
            )}
            {provider.email && (
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Image src="/icons/services/email.svg" alt="" width={24} height={24} />
                  Email
                </span>
                <a href={`mailto:${provider.email}`} className="break-all hover:underline">
                  {provider.email}
                </a>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export function ProviderDetail({ provider }: { provider: Provider }) {
  const [tab, setTab] = useState<Tab>("about");
  const [slide, setSlide] = useState(0);

  return (
    <div className="flex flex-col gap-12 pt-10 pb-16">
      <div className="relative h-[240px] w-full overflow-hidden bg-border-card sm:h-[400px]">
          <Image
            src={GALLERY[slide]}
            alt={`${provider.name} — photo ${slide + 1} of ${GALLERY.length}`}
            fill
            priority
            sizes="(min-width: 1440px) 1056px, 100vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => setSlide((s) => (s + 1) % GALLERY.length)}
            aria-label="Next photo"
            className="absolute right-4 bottom-[26px] flex size-[54px] items-center justify-center rounded-[24px] bg-tertiary p-2 transition-colors hover:bg-[#e5661a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Image src="/icons/services/carousel-next.svg" alt="" width={38} height={38} />
          </button>
      </div>

      <div className="flex flex-col gap-6 sm:px-6">
        <span className="flex items-center gap-1.5 self-start rounded-card border-[1.5px] border-border-hairline bg-border-hairline px-2 py-1 text-[18px] leading-7 font-semibold text-primary">
          <Image src="/icons/services/verified.svg" alt="" width={24} height={24} />
          Verified Partner
        </span>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-serif text-[36px] leading-[44px] text-text-primary sm:text-[54px] sm:leading-[60px]">
              {provider.name}
            </h1>
            <FavoriteButton providerName={provider.name} tone="tertiary" />
          </div>
          <p className="max-w-[360px] text-[18px] leading-7 text-text-secondary">{provider.address}</p>
          <a
            href={directionsUrl(provider.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 self-start text-[18px] leading-7 font-semibold text-tertiary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Image src="/icons/services/directions.svg" alt="" width={24} height={24} />
            Get Directions
          </a>
          <div className="self-start">
            <CompareToggle providerId={provider.id} />
          </div>
        </div>

        <dl className="flex items-stretch rounded-card bg-bg-base text-center text-text-secondary">
          {[
            { value: String(provider.rating), label: "Ratings" },
            { value: provider.experience, label: "Experience" },
            { value: provider.visits, label: "Visits done" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-1 flex-col-reverse items-center justify-end gap-0.5 px-2 py-3 ${
                i === 1 ? "border-x-[1.5px] border-border-hairline" : ""
              }`}
            >
              <dt className="text-[16px] leading-5">{stat.label}</dt>
              <dd className="text-[24px] leading-8 font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <SegmentedTabs<Tab>
          ariaLabel="Provider information"
          options={[
            { value: "about", label: "About" },
            { value: "review", label: "Review" },
          ]}
          value={tab}
          onChange={setTab}
        />

        <div role="tabpanel" aria-label={tab === "about" ? "About" : "Review"}>
          {tab === "about" ? <AboutTab provider={provider} /> : <ReviewTab provider={provider} />}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:gap-6">
        <Link
          href={`/services/${provider.id}/request-callback`}
          className="flex h-12 flex-1 items-center justify-center rounded-control bg-primary px-4 text-[18px] leading-7 font-semibold text-white transition-colors hover:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Request a Callback
        </Link>
        {provider.website ? (
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 flex-1 items-center justify-center rounded-control bg-secondary px-4 text-[18px] leading-7 font-semibold text-white transition-colors hover:bg-[#0d250f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Visit Website
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <p className="flex h-12 flex-1 items-center justify-center rounded-control border border-border-hairline text-[16px] text-text-muted">
            Website not listed
          </p>
        )}
      </div>
    </div>
  );
}

export default ProviderDetail;
