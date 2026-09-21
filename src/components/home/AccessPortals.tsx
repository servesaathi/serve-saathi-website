import Button from "@/components/ui/Button";

// Entry points for the three audiences, straight under the hero: families
// (normal users), providers, and Serve Saathi admins.
const PORTALS = [
  {
    title: "Families & seniors",
    body: "Find trusted care, track requests and stay close to a parent's wellbeing.",
    primary: { label: "Sign up", href: "/join" },
    secondary: { label: "Log in", href: "/login" },
  },
  {
    title: "Care providers",
    body: "List your facility, get verified and reach families actively looking for care.",
    primary: { label: "Provider onboarding", href: "/provider/onboarding" },
    secondary: { label: "Provider log in", href: "/provider/login" },
  },
  {
    title: "Serve Saathi admin",
    body: "Review provider applications and manage the platform.",
    primary: { label: "Admin log in", href: "/admin/login" },
  },
];

export function AccessPortals() {
  return (
    <section aria-labelledby="access-heading" className="py-6">
      <h2 id="access-heading" className="sr-only">
        Choose how you want to continue
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {PORTALS.map((p) => (
          <div key={p.title} className="flex flex-col gap-4 rounded-card bg-bg-base p-6">
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="text-[20px] leading-7 font-semibold text-text-primary">{p.title}</h3>
              <p className="text-[16px] leading-[22px] text-text-secondary">{p.body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href={p.primary.href}>{p.primary.label}</Button>
              {p.secondary && (
                <Button href={p.secondary.href} variant="light">
                  {p.secondary.label}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AccessPortals;
