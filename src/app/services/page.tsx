"use client";

import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Greeting } from "@/components/app/Greeting";
import { PromoBanner } from "@/components/app/PromoBanner";
import { ServiceCategoryGrid } from "@/components/app/ServiceCategoryGrid";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";

// "Services - All Services" — Figma node 2015:84742 (Screen 2015:84744).
type Tab = "mine" | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "mine", label: "My Services" },
  { value: "all", label: "All Services" },
];

export default function ServicesPage() {
  const [tab, setTab] = useState<Tab>("all");

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <Greeting />

        <div className="flex w-full max-w-[920px] flex-col gap-6">
          <PromoBanner
            eyebrow="What do you need today?"
            heading="Care at your Doorstep"
            subtext="Trusted help, whenever you need"
          />
          <SegmentedTabs
            options={TABS}
            value={tab}
            onChange={setTab}
            ariaLabel="Services view"
          />
        </div>

        {tab === "all" ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-center text-[22px] leading-tight font-semibold text-text-primary sm:text-[26px] lg:text-[30px]">
              What do you need help with?
            </h2>
            <ServiceCategoryGrid />
          </section>
        ) : (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
            <p className="text-[18px] font-semibold text-text-primary">No services yet</p>
            <p className="max-w-[420px] text-[16px] leading-[22px] text-text-secondary">
              Services you book or subscribe to will show up here.
            </p>
            <button
              type="button"
              onClick={() => setTab("all")}
              className="text-[16px] font-bold text-primary hover:underline"
            >
              Browse all services
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
