import type { ReactNode } from "react";
import { OnboardingPanel } from "./OnboardingPanel";
import { SignInPrompt } from "./SignInPrompt";

// Shared two-column shell for the account auth screens (Join, Phone Verify,
// OTP, Create account, Login). Onboarding panel on the left, a form column on
// the right with a green H1 and the top-right sign-in prompt.
//
// Layout: on lg+ the whole shell is exactly viewport-tall and does NOT scroll
// the page — the form column is its own scroll container (`lg:overflow-y-auto`)
// and only scrolls when a tall form (e.g. Create account) genuinely exceeds
// the viewport, while the panel stays fixed. Short content is vertically
// centered.

type AuthLayoutProps = {
  /** Which onboarding slide the left panel shows for this step. */
  slide?: number;
  /** The green H1 at the top of the form column. */
  title?: string;
  /** "signup" → "Already have an account? Log in"; "login" → "Don't have an account yet? Sign up". */
  promptVariant?: "signup" | "login";
  children: ReactNode;
};

export function AuthLayout({
  slide = 0,
  title = "Welcome to Serve Saathi",
  promptVariant = "signup",
  children,
}: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-bg-layout lg:h-dvh lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <OnboardingPanel activeSlide={slide} />

      <div className="relative flex w-full flex-1 flex-col lg:h-dvh lg:overflow-y-auto">
        <SignInPrompt
          variant={promptVariant}
          className="shrink-0 self-end px-6 pt-6 sm:px-10 lg:absolute lg:right-12 lg:top-12 lg:z-10 lg:px-0 lg:pt-0"
        />

        <div className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-10 sm:px-10 lg:gap-10 lg:px-16 lg:py-16">
          <div className="flex w-full max-w-[600px] flex-col items-center gap-8 lg:gap-10">
            <h1 className="text-center text-[26px] font-semibold text-primary sm:text-[32px]">
              {title}
            </h1>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;
