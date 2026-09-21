import { SectionHeading } from "@/components/app/SectionHeading";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { SiteShell } from "@/components/site/SiteShell";
import { OrganizationCard } from "@/components/ui/OrganizationCard";

// "01a_MyCare / Overview" — Figma node 3344:334457, the "Existing User"
// module (top-level section 3388:84693) of the 09/2026 website redesign.
// Replaces the old dashboard's AppShell/ServiceCategoryGrid content — no
// tasks/requests/bookings API exists yet (that's the Track Request module),
// so these lists render the design's sample content as local config, same
// pattern as the pre-redesign dashboard used.
const TODAYS_TASKS = [
  {
    title: "Seated strength routine",
    time: "Afternoon",
    detail: "15 minutes of the physiotherapist-prescribed chair set.",
  },
  {
    title: "Memory exercise block",
    time: "Morning",
    detail: "20 minutes: recall sequence, word list, newspaper summary aloud.",
  },
  {
    title: "BP dose reminder",
    time: "Morning",
    detail: "Set up for today",
  },
];

const TRACK_REQUESTS = [
  {
    icon: "/icons/homepage/dash-caregiver-icon.svg",
    title: "Caregiver HelpAge India",
    subtitle: "Requested 2 hrs ago",
    chip: "In Progress",
    accent: "primary" as const,
  },
];

const BOOKINGS = [
  {
    icon: "/icons/homepage/dash-booking-icon.svg",
    title: "Yoga & Wellness",
    subtitle: "Zoom",
    meta: "23 April · 9:00 AM",
    categoryLabel: "Social Events",
  },
];

export default function DashboardPage() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-10 py-10">
        <DashboardGreeting />

        <div className="flex flex-col items-stretch gap-6 lg:flex-row">
          <ScoreCard />
          <ProgressCard completed={1} total={9} />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <section className="flex flex-col gap-2">
            <SectionHeading title="Today's Care Tasks" action={{ label: "View All", href: "/care-plan" }} />
            <p className="text-[16px] leading-[22px] text-text-secondary">1 of 9 completes</p>
            <div className="flex flex-col gap-3 pt-1">
              {TODAYS_TASKS.map((t) => (
                <TaskCard key={t.title} {...t} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <SectionHeading title="Track Requests" action={{ label: "View All", href: "/service-history" }} />
            <div className="flex flex-col gap-3 pt-1">
              {TRACK_REQUESTS.map((t) => (
                <OrganizationCard key={t.title} variant="status" {...t} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <SectionHeading title="Bookings" action={{ label: "View All", href: "/service-history" }} />
            <div className="flex flex-col gap-3 pt-1">
              {BOOKINGS.map((t) => (
                <OrganizationCard key={t.title} variant="category" accent="forest" {...t} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
