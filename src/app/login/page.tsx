import Link from "next/link";
import { LoginForm } from "@/components/onboarding/LoginForm";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Logo } from "@/components/ui/Logo";

// "05_Homepage / Login or Create an account" — Figma node 3398:66345, the
// 09/2026 website redesign's login card. Centered on the shared Site chrome
// (SiteHeader/SiteFooter, no sidebar — this is the unauthenticated
// conversion page) instead of the older two-column AuthLayout/
// OnboardingPanel treatment, so /login now reads as part of the same site
// as everywhere else. Scoped to this route only — join/verify-phone/
// verify-otp/create-account still use AuthLayout.
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-layout">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
        <div className="flex w-full max-w-[500px] flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center gap-4">
            <Logo tone="color" height={80} priority />
            <p className="text-center text-[18px] leading-7 text-text-secondary">
              Log in to check on the seniors you care continue their journey.
            </p>
          </div>

          <LoginForm />

          <p className="text-[18px] leading-7 text-text-secondary">
            Don&apos;t have an account yet?{" "}
            <Link href="/join" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
