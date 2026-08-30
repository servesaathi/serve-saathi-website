import { AppShell } from "@/components/app/AppShell";
import { Greeting } from "@/components/app/Greeting";
import { QuoteCard } from "@/components/app/QuoteCard";
import { SectionHeading } from "@/components/app/SectionHeading";
import { ServiceCategoryGrid } from "@/components/app/ServiceCategoryGrid";
import { IconCard } from "@/components/ui/IconCard";
import { OrganizationCard } from "@/components/ui/OrganizationCard";

// "Existing Account's Dashboard" — Figma node 1914:31351 (Screen 1914:31353).
//
// The catalog endpoints (/services, /categories) are seeded empty on the
// backend today, and there is no tasks/requests API yet (that's the Track
// Request module), so the lists and service grid render the design's content
// as local config for now — each is a small swap to a service call once data
// exists.

const HELP_ITEMS: {
  label: string;
  icon: string;
  href: string;
  tone?: "orange" | "danger";
}[] = [
  // TODO: dedicated SOS glyph — the Figma asset 404'd on fetch; using the call icon.
  { label: "Emergency SOS", icon: "/icons/dashboard/help-call.svg", href: "/emergency", tone: "danger" },
  { label: "Helpline", icon: "/icons/dashboard/help-helpline.svg", href: "/emergency" },
  { label: "Email", icon: "/icons/dashboard/help-email.svg", href: "mailto:support@servesaathi.com" },
  { label: "Call customer service", icon: "/icons/dashboard/help-call.svg", href: "/emergency" },
  { label: "Support Chat", icon: "/icons/dashboard/help-chat.svg", href: "/support" },
  { label: "FAQ", icon: "/icons/dashboard/help-faq.svg", href: "/support" },
];

const TODAYS_TASKS = [
  {
    icon: "/icons/dashboard/task-doctor.svg",
    title: "Primary Doctor",
    subtitle: "Apollo Clinic",
    meta: "9:00 AM",
    accent: "secondary" as const,
  },
];

const TRACK_REQUESTS = [
  {
    icon: "/icons/dashboard/task-caregiver.svg",
    title: "Caregiver HelpAge India",
    subtitle: "Requested 2 hrs ago",
    chip: "In Progress",
    accent: "primary" as const,
  },
];

const UPCOMING = [
  {
    icon: "/icons/dashboard/card-category.svg",
    title: "Doctor Appointment",
    subtitle: "Apollo Clinic Gynecologist",
    meta: "23 April · 9:00 AM",
    categoryLabel: "Infrastructure",
  },
  {
    icon: "/icons/dashboard/card-category.svg",
    title: "Yoga & Wellness",
    subtitle: "Zoom",
    meta: "23 April · 9:00 AM",
    categoryLabel: "Social Events",
  },
  {
    icon: "/icons/dashboard/card-category.svg",
    title: "Yoga & Wellness",
    subtitle: "Zoom",
    meta: "23 April · 9:00 AM",
    categoryLabel: "Social Events",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <Greeting />

        {/* Quote of the day */}
        <QuoteCard
          quote={'"Every morning is a fresh opportunity to embrace life with joy. You are not alone, your Saathi is here."'}
          action={{ label: "How are you feeling today?", href: "/mood-check" }}
        />

        {/* Lists */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="flex flex-col gap-2">
            <SectionHeading title="Today's Task" action={{ label: "View All", href: "/tasks" }} />
            {TODAYS_TASKS.map((t, i) => (
              <OrganizationCard key={i} variant="status" {...t} />
            ))}
          </section>

          <section className="flex flex-col gap-2">
            <SectionHeading
              title="Track Requests"
              action={{ label: "View All", href: "/requests" }}
            />
            {TRACK_REQUESTS.map((t, i) => (
              <OrganizationCard key={i} variant="status" {...t} />
            ))}
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeading title="Upcoming" action={{ label: "View All", href: "/upcoming" }} />
            {UPCOMING.map((t, i) => (
              <OrganizationCard key={i} variant="category" accent="forest" {...t} />
            ))}
          </section>
        </div>

        {/* Service categories */}
        <section className="flex flex-col gap-4">
          <SectionHeading title="What do you need help with?" />
          <ServiceCategoryGrid />
        </section>

        {/* Help & Support */}
        <section className="flex flex-col gap-4">
          <SectionHeading title="Help & Support" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {HELP_ITEMS.map((h) => (
              <IconCard key={h.label} label={h.label} icon={h.icon} href={h.href} tone={h.tone} />
            ))}
          </div>
          <p className="text-[16px] leading-[22px] text-text-secondary">
            Available services{" "}
            <span className="font-semibold text-primary">8:00 AM to 6:00 PM</span> IST
          </p>
        </section>
      </div>
    </AppShell>
  );
}
