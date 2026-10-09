"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Assessment } from "@/lib/ews/ewsService";
import { focusAreas } from "@/lib/ews/flow";
import { BANDS, COPY, DIMS, dimById, type DimId } from "@/lib/ews/questionnaire";
import { useEws } from "@/lib/ews/useEws";
import { CallbackDialog } from "./CallbackDialog";

// "03b_Homepage / Elder Wellbieng Overview - View Plan" — Figma 3344:333450.
// Layout follows the frame (green banner with done count, task cards with a
// left green rule + orange checkbox + area chip, a right-hand column, the dark
// "Need a hand with your care?" band). Content follows the spec: tasks are
// each focus area's "next steps" (spec C/F), grouped by area rather than
// Figma's Morning/Afternoon/Evening placeholders (the steps aren't daily
// routines). "Recommended providers · ₹749 · Book now" becomes "Find support"
// discovery links — no prices, no booking.

const planKey = (id: string) => `servesaathi-ews-plan:${id}`;

export function CarePlan() {
  const ews = useEws();
  const router = useRouter();
  const latest = ews.status === "ready" ? ews.latest : null;
  const hasResult = Boolean(latest?.result);

  useEffect(() => {
    if (ews.status === "signed_out") router.replace("/login?next=/elder-wellbeing-score/plan");
    else if (ews.status === "ready" && !hasResult) router.replace("/elder-wellbeing-score");
  }, [ews.status, hasResult, router]);

  if (!latest?.result) return <div className="min-h-[60vh]" aria-busy="true" />;
  return <Plan key={latest.id} assessment={latest} />;
}

function Plan({ assessment }: { assessment: Assessment }) {
  const result = assessment.result!;
  const focus = focusAreas(result);
  const tasks = focus.flatMap((dim) => COPY[dim].steps.map((step) => ({ id: `${dim}:${step}`, dim, step })));
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(planKey(assessment.id)) ?? "[]") as string[];
    } catch {
      return [];
    }
  });
  const [callbackOpen, setCallbackOpen] = useState(false);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    try {
      window.localStorage.setItem(planKey(assessment.id), JSON.stringify(next));
    } catch {
      // Storage blocked — ticks last for this visit only.
    }
  };

  const goingWell = DIMS.filter((d) => result.dims[d.id].band === "going_well").slice(0, 3);

  return (
    <div className="flex flex-col gap-10 py-10">
      <section className="relative isolate overflow-hidden rounded-card bg-primary px-6 py-5 text-white">
        <Image
          src="/icons/ews/plan-banner-intersect.svg"
          alt=""
          width={315}
          height={145}
          className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-auto"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary from-[62%] to-primary/0" />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex max-w-[657px] flex-col gap-4">
            <h1 className="text-[26px] leading-8 font-semibold sm:text-[30px] sm:leading-9">Your care plan</h1>
            <p className="text-[18px] leading-6">
              Next steps for the areas that could use the most support right now. The plan updates each time you complete a
              check-in.
            </p>
          </div>
          {tasks.length > 0 && (
            <p className="flex flex-col items-center text-center" aria-live="polite">
              <span>
                <span className="text-[32px] font-semibold">{done.length}</span>
                <span className="text-[22px] leading-[30px]">/{tasks.length}</span>
              </span>
              <span className="text-[16px] leading-[22px] uppercase">Done</span>
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="ews-active-plan" className="flex flex-col gap-6">
        <h2 id="ews-active-plan" className="text-[28px] leading-[42px] font-semibold text-text-primary sm:text-[32px]">
          Your Active Plan
        </h2>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            {focus.length === 0 && (
              <div className="flex flex-col gap-3 rounded-card bg-bg-base p-6">
                <p className="text-[22px] leading-[30px] font-semibold text-text-primary">Things are going well — keep it up</p>
                <ul className="list-disc pl-6 text-[18px] leading-7 text-text-secondary">
                  {goingWell.map((d) => (
                    <li key={d.id}>{COPY[d.id].going_well}</li>
                  ))}
                </ul>
              </div>
            )}
            {focus.map((dim) => (
              <TaskGroup key={dim} dim={dim} assessment={assessment} done={done} onToggle={toggle} />
            ))}
          </div>

          <aside aria-labelledby="ews-find-support" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="ews-find-support" className="text-[22px] leading-[30px] font-semibold text-text-primary">
                Find support
              </h2>
              <p className="text-[18px] leading-7 text-text-secondary">Matched to the areas that could use the most support</p>
            </div>
            {focus.map((dim) => {
              const directory = COPY[dim].resources.find((r) => r.startsWith("Directory"));
              return (
                <div key={dim} className="flex flex-col gap-3 rounded-card bg-bg-base p-5">
                  <span className="self-start rounded-full bg-orange-line px-4 py-0.5 text-[16px] leading-[22px] text-[#994613]">
                    {dimById(dim).short}
                  </span>
                  <p className="text-[18px] leading-7 font-semibold text-text-primary">{dimById(dim).name}</p>
                  <p className="text-[16px] leading-[22px] text-text-secondary">
                    {directory?.replace(/^Directory: /, "Browse ") ?? COPY[dim].resources[0]}
                  </p>
                  <Button href="/services" variant="light">
                    Explore services
                  </Button>
                </div>
              );
            })}
            <p className="text-[14px] leading-5 text-text-muted">Listings are for discovery only – Serve Saathi does not endorse providers.</p>
          </aside>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-[16px] bg-secondary px-6 py-8 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-9">
        <div className="flex flex-col gap-4">
          <h2 className="text-[26px] leading-[34px] font-semibold">Need a hand with your care?</h2>
          <p className="text-[18px] leading-6">Your Saathi can help find a service or answer a care question.</p>
        </div>
        <Button onClick={() => setCallbackOpen(true)} className="sm:w-[200px]">
          Talk to a Saathi
        </Button>
      </section>

      <CallbackDialog open={callbackOpen} onClose={() => setCallbackOpen(false)} category="general" />
    </div>
  );
}

function TaskGroup({
  dim,
  assessment,
  done,
  onToggle,
}: {
  dim: DimId;
  assessment: Assessment;
  done: string[];
  onToggle: (id: string) => void;
}) {
  const d = dimById(dim);
  const band = assessment.result!.dims[dim].band;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[22px] leading-[30px] font-semibold text-text-primary">
        {d.name}{" "}
        <span className="text-[16px] leading-[22px] font-normal text-text-tertiary">
          · {BANDS[band].mark} {BANDS[band].label}
        </span>
      </h3>
      <ul className="flex flex-col gap-4">
        {COPY[dim].steps.map((step) => {
          const id = `${dim}:${step}`;
          const checked = done.includes(id);
          return (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-4 rounded-card border-l-4 border-primary bg-bg-base p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
                <input type="checkbox" checked={checked} onChange={() => onToggle(id)} className="sr-only" />
                <span
                  aria-hidden
                  className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-control border-[1.5px] border-tertiary ${checked ? "bg-tertiary" : "bg-bg-base"}`}
                >
                  {checked && <Image src="/icons/homepage/explore-checkbox-check.svg" alt="" width={16} height={16} loading="eager" />}
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-start justify-between gap-2">
                    <span className={`text-[18px] leading-7 font-semibold text-text-secondary ${checked ? "line-through" : ""}`}>{step}</span>
                    <span className="rounded-full bg-orange-line px-4 py-0.5 text-[13px] leading-[17px] text-[#994613]">{d.short}</span>
                  </span>
                  <span className="text-[18px] leading-7 text-text-muted">{COPY[dim][band as "closer_look" | "needs_attention"]}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CarePlan;
