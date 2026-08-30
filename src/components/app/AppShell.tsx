import type { ReactNode } from "react";
import { WebFooter } from "./WebFooter";
import { WebHeader } from "./WebHeader";

// Standard chrome for every signed-in page: sticky website header, the page
// content in a centred max-w-1440 column, then the light footer.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <WebHeader />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 sm:px-12 lg:px-16 lg:py-16">
        {children}
      </main>
      <WebFooter />
    </div>
  );
}

export default AppShell;
