// Figma node 3316:43496 — H2-scale Source Serif Pro title + Body Large
// subtitle. Count is a placeholder until a real providers API exists.
export function ExploreServiceHeader() {
  return (
    <div className="flex w-full flex-col gap-1">
      <h1 className="font-serif text-[40px] leading-[48px] text-text-primary">Find Care Facilities</h1>
      <p className="text-[18px] leading-7 text-text-secondary">Showing 100 verified organizations in your area</p>
    </div>
  );
}

export default ExploreServiceHeader;
