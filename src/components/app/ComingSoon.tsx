import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";

// Placeholder for signed-in sections not built yet, so header/nav links resolve.
export function ComingSoon({ title, module }: { title: string; module?: string }) {
  return (
    <SiteShell>
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 py-10 text-center">
        <h1 className="text-[26px] font-semibold text-primary sm:text-[32px]">{title}</h1>
        <p className="max-w-[420px] text-[16px] leading-[22px] text-text-secondary">
          {module ? `The ${module} is coming soon.` : "This section is coming soon."}
        </p>
        <Link href="/dashboard" className="text-[16px] font-bold text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    </SiteShell>
  );
}

export default ComingSoon;
