import { CategoryIconRow } from "@/components/services/CategoryIconRow";
import { CompareBar } from "@/components/services/CompareBar";
import { ExploreServiceHeader } from "@/components/services/ExploreServiceHeader";
import { FilterSidebar } from "@/components/services/FilterSidebar";
import { ProviderResults } from "@/components/services/ProviderResults";
import { SearchFilterBar } from "@/components/services/SearchFilterBar";
import { SiteShell } from "@/components/site/SiteShell";

// "02_Homepage / Explore Service" — Figma node 3313:79715, the 09/2026
// website redesign's Care Facilities listing (Sidebar's "Explore Services"
// submenu lands here). Ticking "Compare" on cards opens the CompareBar
// (Figma "Compare 1/2/3"), which leads to /services/compare.
export default function ServicesPage() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-6 py-10">
        <ExploreServiceHeader />
        <SearchFilterBar />
        <CategoryIconRow />

        <div className="flex w-full flex-col gap-10 lg:flex-row">
          <FilterSidebar />
          <ProviderResults />
        </div>
      </div>
      <CompareBar />
    </SiteShell>
  );
}
