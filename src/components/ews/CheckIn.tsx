"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
import { Button } from "@/components/ui/Button";
import {
  completeAssessment,
  saveProgress,
  saveResponse,
  type Assessment,
  type Progress,
  type SafetyEvent,
  type SafetyUserAction,
} from "@/lib/ews/ewsService";
import { dimItems, extraChoice, optionLabel, questionText, s8Applies, triggerFor, type FlowContext } from "@/lib/ews/flow";
import { DIMS, SAFETY, type Answers, type Item, type SafetyId } from "@/lib/ews/questionnaire";
import { ChoiceCard } from "./ChoiceCard";
import { ResultDialog } from "./ResultDialog";
import { SafetyDialog } from "./SafetyDialog";
import { StepBar } from "./StepBar";

// One question per screen — Figma "01–08_Personalized Question" (3344:201271
// …): form column + the shared OnboardingPanel photo column, "Save & Exit"
// top-left, segmented progress by area, area name in orange, question as a
// 32px heading, select cards, Back / Next. Figma's 9 placeholder questions are
// replaced by the spec's 8 areas (~26 questions); everything else follows the
// frame. Flow logic is the demo's goQuestion()/commit()/endDim()/finish().

type Screen = "intro" | "question" | "jit" | "saved";
type OpenSafety = { key: string; returnTo: "question" | "endDim" };

type CheckInProps = {
  userId: string;
  initial: Assessment;
};

export function CheckIn({ userId, initial }: CheckInProps) {
  const router = useRouter();
  const { mode, privateConfirmed, proxy } = initial;
  const elderName = proxy?.elderName ?? "";

  const [answers, setAnswers] = useState<Answers>(initial.answers);
  // Restricted answers (EMO4/HOM4/…P, FIN3) live only in component memory, for
  // Back navigation and show rules — EMO4/HOM4 are never persisted at all, and
  // FIN3 is written only to the separate restricted store.
  const [privateAnswers, setPrivateAnswers] = useState<Answers>({});
  const [progress, setProgress] = useState<Progress>(initial.progress);
  const [events, setEventsState] = useState<SafetyEvent[]>(initial.events);
  // Mirror so completion can save the very latest safety actions, including
  // the one recorded in the same click that finishes the check-in.
  const eventsRef = useRef(events);
  const setEvents = useCallback((fn: (prev: SafetyEvent[]) => SafetyEvent[]) => {
    eventsRef.current = fn(eventsRef.current);
    setEventsState(eventsRef.current);
  }, []);
  const [screen, setScreen] = useState<Screen>("intro");
  const [selected, setSelected] = useState<string | null>(null);
  const [openSafety, setOpenSafety] = useState<OpenSafety | null>(null);
  const [completed, setCompleted] = useState<Assessment | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const all: Answers = { ...answers, ...privateAnswers };
  const ctxFor = (a: Answers): FlowContext => ({ mode, privateOk: privateConfirmed, answers: a });
  const ctx = ctxFor(all);
  const dim = DIMS[Math.min(progress.dimIdx, DIMS.length - 1)];
  const list = dimItems(dim.id, ctx);
  const item: Item | undefined = list[progress.qIdx];

  // Persist position + safety events after every step so the check-in can be
  // resumed for 7 days.
  useEffect(() => {
    if (!completed) saveProgress(userId, initial.id, progress, events);
  }, [userId, initial.id, progress, events, completed]);

  // Move focus to the new heading on every screen change — one question per
  // screen only works for screen-reader users if they land on the question.
  useEffect(() => {
    headingRef.current?.focus();
  }, [screen, progress.dimIdx, progress.qIdx]);

  const fire = useCallback(
    (id: SafetyId): SafetyEvent => {
      const event: SafetyEvent = {
        key: `${id}-${Date.now()}`,
        id,
        tier: SAFETY[id].tier,
        at: new Date().toISOString(),
        mode,
        actions: [],
        share: false,
      };
      setEvents((prev) => [...prev, event]);
      return event;
    },
    [mode, setEvents]
  );

  /** `nextAll`: standard + private answers as of this step. */
  const showQuestion = (p: Progress, nextAll: Answers = all) => {
    const next = dimItems(DIMS[p.dimIdx].id, ctxFor(nextAll))[p.qIdx];
    if (!next) return endDim(p, nextAll);
    setProgress(p);
    setSelected(nextAll[next.id] ?? null);
    setScreen(next.jit && !p.jitSeen.includes(next.id) ? "jit" : "question");
  };

  const endDim = async (p: Progress, nextAll: Answers) => {
    if (p.pending.length) {
      const [key, ...rest] = p.pending;
      setProgress({ ...p, pending: rest });
      setOpenSafety({ key, returnTo: "endDim" });
      return;
    }
    if (p.dimIdx === DIMS.length - 1) {
      if (!p.s8Checked) {
        const checked = { ...p, s8Checked: true };
        if (s8Applies(nextAll)) {
          const ev = fire("S8");
          return endDim({ ...checked, pending: [ev.key] }, nextAll);
        }
        return endDim(checked, nextAll);
      }
      setProgress(p);
      await saveProgress(userId, initial.id, p, eventsRef.current);
      const done = await completeAssessment(userId, initial.id);
      setCompleted(done);
      return;
    }
    setProgress({ ...p, dimIdx: p.dimIdx + 1, qIdx: 0 });
    setScreen("intro");
  };

  const commit = async (code: string) => {
    if (!item) return;
    if (item.restricted || item.restrictedStore) setPrivateAnswers((prev) => ({ ...prev, [item.id]: code }));
    else setAnswers((prev) => ({ ...prev, [item.id]: code }));
    const nextAll = { ...all, [item.id]: code };
    await saveResponse(userId, initial.id, item.id, code);

    const next: Progress = { ...progress, qIdx: progress.qIdx + 1 };
    const trigger = triggerFor(item, code);
    if (trigger) {
      const ev = fire(trigger);
      if (SAFETY[trigger].tier === 2) return showQuestion({ ...next, pending: [...next.pending, ev.key] }, nextAll);
      setProgress(next);
      setOpenSafety({ key: ev.key, returnTo: "question" });
      return;
    }
    showQuestion(next, nextAll);
  };

  const back = () => {
    const target = progress.qIdx - 1;
    if (target < 0) return setScreen("intro");
    setProgress({ ...progress, qIdx: target });
    setSelected(all[list[target].id] ?? null);
    setScreen("question");
  };

  const introBack = () => {
    if (progress.dimIdx === 0) return;
    const prevDim = DIMS[progress.dimIdx - 1];
    const prevList = dimItems(prevDim.id, ctx);
    const last = prevList[prevList.length - 1];
    setProgress({ ...progress, dimIdx: progress.dimIdx - 1, qIdx: prevList.length - 1 });
    setSelected(all[last.id] ?? null);
    setScreen("question");
  };

  const saveAndExit = () => {
    setOpenSafety(null);
    setScreen("saved");
  };

  const recordAction = (action: SafetyUserAction) => {
    if (!openSafety) return;
    setEvents((prev) => prev.map((e) => (e.key === openSafety.key ? { ...e, actions: [...e.actions, action] } : e)));
  };

  const closeSafety = () => {
    if (!openSafety) return;
    const { key, returnTo } = openSafety;
    setEvents((prev) => prev.map((e) => (e.key === key && e.actions.length === 0 ? { ...e, actions: ["dismissed"] } : e)));
    setOpenSafety(null);
    if (returnTo === "endDim") endDim(progress, all);
    else showQuestion(progress);
  };

  const safetyEvent = openSafety ? events.find((e) => e.key === openSafety.key) ?? null : null;
  const doneAreas = Math.min(progress.dimIdx, DIMS.length);

  return (
    <div className="flex min-h-dvh flex-col-reverse bg-bg-layout lg:flex-row">
      <main className="flex min-w-0 flex-1 flex-col gap-10 px-4 py-8 sm:px-10 lg:px-[100px] lg:py-20">
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={screen === "saved" ? () => router.push("/elder-wellbeing-score") : saveAndExit}
            className="flex items-center gap-2 self-start rounded-control text-[18px] leading-7 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Image src="/icons/ews/arrow-left-primary.svg" alt="" width={24} height={24} />
            {screen === "saved" ? "Back to Home" : "Save & Exit"}
          </button>
          <StepBar current={Math.min(progress.dimIdx + 1, DIMS.length)} total={DIMS.length} label={`Area ${progress.dimIdx + 1} of ${DIMS.length}`} />
        </div>

        {proxy && screen !== "saved" && (
          <p className="rounded-card bg-bg-orange px-4 py-3 text-[18px] leading-7 text-text-secondary">
            You are answering about <strong className="text-text-primary">{elderName}</strong>. Answer from what you have seen.
          </p>
        )}

        {screen === "intro" && (
          <section className="flex flex-1 flex-col gap-6" aria-labelledby="ews-heading">
            <p className="text-[24px] leading-8 font-semibold text-tertiary">
              Area {progress.dimIdx + 1} of {DIMS.length}
            </p>
            <h1 id="ews-heading" ref={headingRef} tabIndex={-1} className="text-[28px] leading-9 font-semibold text-text-primary outline-none sm:text-[32px] sm:leading-[42px]">
              {dim.name}
            </h1>
            <p className="text-[18px] leading-7 text-text-secondary">
              A few short questions about {proxy ? dim.about.replace("you have", "they have") : dim.about}.
            </p>
            {dim.personal && (
              <p className="rounded-card border-[1.5px] border-border-hairline bg-bg-base px-4 py-3 text-[18px] leading-7 text-text-secondary">
                🔒 The next questions are personal. Some answers are private: never shown to family members and not included in any
                report. You can skip them.
              </p>
            )}
            <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row lg:gap-[200px]">
              {progress.dimIdx > 0 ? (
                <BackButton onClick={introBack} />
              ) : (
                <span className="hidden flex-1 sm:block" />
              )}
              <Button fullWidth onClick={() => showQuestion({ ...progress, qIdx: 0 })} rightIcon={<NextIcon />}>
                Let’s go
              </Button>
            </div>
          </section>
        )}

        {screen === "jit" && item && (
          <section className="flex flex-1 flex-col gap-6" aria-labelledby="ews-heading">
            <p className="text-[24px] leading-8 font-semibold text-tertiary">{dim.name}</p>
            <h1 id="ews-heading" ref={headingRef} tabIndex={-1} className="text-[28px] leading-9 font-semibold text-text-primary outline-none sm:text-[32px] sm:leading-[42px]">
              🔒 The next question is personal.
            </h1>
            <p className="text-[18px] leading-7 text-text-secondary">
              Your answer is private: it is never shown to family members and is not included in any report.
            </p>
            <p className="text-[18px] leading-7 text-text-secondary">You can skip it.</p>
            <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row lg:gap-[200px]">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => showQuestion({ ...progress, jitSeen: [...progress.jitSeen, item.id], qIdx: progress.qIdx + 1 })}
              >
                Skip
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setProgress({ ...progress, jitSeen: [...progress.jitSeen, item.id] });
                  setScreen("question");
                }}
                rightIcon={<NextIcon />}
              >
                Continue
              </Button>
            </div>
          </section>
        )}

        {screen === "question" && item && (
          <QuestionScreen
            key={item.id}
            headingRef={headingRef}
            dimName={dim.name}
            item={item}
            index={progress.qIdx}
            count={list.length}
            text={questionText(item, mode, elderName)}
            options={[
              ...item.options.map((o) => ({ value: o.code, label: optionLabel(item, o.code, mode) })),
              ...[extraChoice(item, mode)].filter((x): x is { code: string; label: string } => x !== null).map((x) => ({ value: x.code, label: x.label })),
            ]}
            selected={selected}
            onSelect={setSelected}
            onBack={back}
            onNext={() => selected && commit(selected)}
          />
        )}

        {screen === "saved" && (
          <section className="flex flex-1 flex-col gap-6" aria-labelledby="ews-heading">
            <h1 id="ews-heading" ref={headingRef} tabIndex={-1} className="text-[32px] leading-[42px] font-semibold text-text-primary outline-none">
              Saved
            </h1>
            <p className="text-[18px] leading-7 text-text-secondary">
              You’ve finished {doneAreas} of {DIMS.length} areas. Come back any time in the next 7 days to finish.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button href="/elder-wellbeing-score">Back to Home</Button>
              <Button variant="light" onClick={() => setScreen("intro")}>
                Keep going
              </Button>
            </div>
          </section>
        )}
      </main>

      <div className="lg:sticky lg:top-0 lg:self-start">
        <OnboardingPanel />
      </div>

      <SafetyDialog
        event={safetyEvent}
        mode={mode}
        context="check-in"
        onAction={recordAction}
        onToggleShare={(share) => setEvents((prev) => prev.map((e) => (e.key === openSafety?.key ? { ...e, share } : e)))}
        onContinue={closeSafety}
        onStopForNow={() => {
          recordAction("dismissed");
          saveAndExit();
        }}
        onQuickExit={() => {
          // Leave nothing personal on screen; the draft stays resumable.
          setOpenSafety(null);
          router.replace("/");
        }}
      />

      <ResultDialog assessment={completed} onView={() => router.push("/elder-wellbeing-score")} />
    </div>
  );
}

function QuestionScreen({
  headingRef,
  dimName,
  item,
  index,
  count,
  text,
  options,
  selected,
  onSelect,
  onBack,
  onNext,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  dimName: string;
  item: Item;
  index: number;
  count: number;
  text: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <form
      className="flex flex-1 flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
    >
      <div className="flex flex-col gap-6">
        <p className="text-[24px] leading-8 font-semibold text-tertiary">{dimName}</p>
        <div className="flex flex-col gap-2">
          <p className="text-[16px] leading-[22px] text-text-tertiary">
            Question {index + 1} of {count}
            {item.optional ? " · optional" : ""}
          </p>
          <h1 ref={headingRef} tabIndex={-1} id="ews-question" className="text-[26px] leading-[34px] font-semibold text-text-primary outline-none sm:text-[32px] sm:leading-[42px]">
            {text}
          </h1>
        </div>
      </div>
      <fieldset aria-labelledby="ews-question" className="flex flex-col gap-4">
        {options.map((o) => (
          <ChoiceCard key={o.value} name={item.id} value={o.value} label={o.label} checked={selected === o.value} onSelect={onSelect} size="lg" />
        ))}
      </fieldset>
      <div className="mt-auto flex flex-col-reverse gap-4 pt-10 sm:flex-row lg:gap-[200px]">
        <BackButton onClick={onBack} />
        <Button type="submit" fullWidth disabled={!selected} rightIcon={<NextIcon />}>
          Next
        </Button>
      </div>
    </form>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="secondary"
      fullWidth
      onClick={onClick}
      leftIcon={<Image src="/icons/ews/arrow-left-white.svg" alt="" width={24} height={24} />}
    >
      Back
    </Button>
  );
}

const NextIcon = () => <Image src="/icons/ews/arrow-right-white.svg" alt="" width={24} height={24} />;

export default CheckIn;
