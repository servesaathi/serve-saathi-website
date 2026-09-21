import Image from "next/image";

// "05. Plans" — Figma node 3395:29226. A preview of the service categories
// (full catalog lives on /services; backend has no live category data yet,
// see [[app-chrome-and-dashboard]] memory — this mirrors the design's
// static content same as the dashboard's service grid).
const CATEGORIES = [
  {
    title: "Care & Living",
    items: ["Assisted Living Communities", "Old Age Homes", "Home Nursing Agencies", "Caregivers"],
  },
  {
    title: "Health & Medical",
    items: ["Hospitals", "Doctors", "Diagnostic Centres", "Physiotherapists", "Pharmacies", "Rehabilitates Centres"],
  },
  {
    title: "Life & Logistics",
    items: ["Legal Advisors", "Financial Planners", "Transportation Providers", "Daily Living Services"],
  },
];

export function Categories() {
  return (
    <section className="rounded-2xl bg-bg-base pt-6 pb-10">
      <div className="mx-auto flex max-w-[1236px] flex-col gap-10 px-8">
        <div>
          <h2 className="pt-4 font-serif text-[32px] leading-[1.2] text-secondary sm:text-[40px] sm:leading-[48px]">
            Every provider your parents will ever need, already verified.
          </h2>
          <p className="mt-2 max-w-[720px] text-[18px] leading-7 text-text-secondary">
            No more cold-calling numbers from a WhatsApp forward. Every provider on Serve Saathi is
            vetted, rated and connected to your family&rsquo;s care plan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="flex flex-col gap-6 rounded-card bg-bg-orange p-6">
              <span className="flex size-12 items-center justify-center rounded-full bg-tertiary">
                <Image src="/icons/homepage/category-icon.svg" alt="" width={32} height={32} aria-hidden />
              </span>
              <div>
                <h3 className="text-[24px] leading-8 font-semibold text-text-primary">{cat.title}</h3>
                <ul>
                  {cat.items.map((item) => (
                    <li key={item} className="border-b border-orange-line py-2 pl-4 text-[18px] leading-7 text-text-secondary last:border-b-0">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
