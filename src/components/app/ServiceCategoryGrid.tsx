import { IconCard } from "@/components/ui/IconCard";

// The "What do you need help with?" category grid, shared by the dashboard and
// the Services landing. Figma nodes 1914:31460 / 2015:85108.
//
// TODO: source from categoryService.getCategories({ isActive: true }) once the
// backend has categories seeded (it returns 0 today). Keep this list as the
// fallback / ordering hint.
export const SERVICE_CATEGORIES = [
  { label: "Infrastructure", icon: "/icons/dashboard/svc-infrastructure.svg", slug: "infrastructure" },
  { label: "Courses", icon: "/icons/dashboard/svc-courses.svg", slug: "courses" },
  { label: "Experts", icon: "/icons/dashboard/svc-experts.svg", slug: "experts" },
  { label: "Social Events", icon: "/icons/dashboard/svc-social-events.svg", slug: "social-events" },
  { label: "Events", icon: "/icons/dashboard/svc-events.svg", slug: "events" },
  { label: "Services", icon: "/icons/dashboard/svc-services.svg", slug: "services" },
  { label: "USP", icon: "/icons/dashboard/svc-usp.svg", slug: "usp" },
  { label: "Travel", icon: "/icons/dashboard/svc-travel.svg", slug: "travel" },
  { label: "Products", icon: "/icons/dashboard/svc-products.svg", slug: "products" },
] as const;

export function ServiceCategoryGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 ${className}`}>
      {SERVICE_CATEGORIES.map((c) => (
        <IconCard
          key={c.slug}
          label={c.label}
          icon={c.icon}
          href={`/services?category=${c.slug}`}
        />
      ))}
    </div>
  );
}

export default ServiceCategoryGrid;
