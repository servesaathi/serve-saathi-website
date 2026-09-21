import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

// New site-wide footer — Figma "Footer" (node 3395:29512), the 09/2026
// website redesign. Dark green, four-column layout + orange "Follow Us"
// card, replaces the light WebFooter copyright-only bar for this page.

const QUICK_LINKS_A = [
  { label: "About Us", href: "/about" },
  { label: "Leadership", href: "/about#leadership" },
  { label: "News", href: "/news" },
  { label: "Careers", href: "/careers" },
];

const QUICK_LINKS_B = [
  { label: "Legal & Policies", href: "/legal" },
  { label: "Contact Us", href: "/contact" },
  { label: "Partner with Us", href: "/partner" },
  { label: "For Organizations", href: "/organizations" },
];

const SOCIALS = [
  { name: "Facebook", href: "https://www.facebook.com/people/Serve-Saathi/61593418850704", icon: "/icons/homepage/social-facebook.svg" },
  { name: "Instagram", href: "https://www.instagram.com/servesaathi_", icon: "/icons/homepage/social-instagram.svg" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/serve-saathi", icon: "/icons/homepage/social-linkedin.svg" },
  { name: "YouTube", href: "https://www.youtube.com/@ServeSaathi", icon: "/icons/homepage/social-youtube.svg" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-secondary">
      <Image
        src="/images/homepage/footer-decoration.svg"
        alt=""
        aria-hidden
        width={287}
        height={287}
        className="pointer-events-none absolute -bottom-16 left-0 hidden lg:block"
      />
      <div className="relative mx-auto flex w-full max-w-[1320px] flex-col gap-12 px-6 py-20 sm:px-12">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row">
          <div className="flex w-full max-w-[295px] flex-col gap-6 pt-9">
            <Logo tone="white" height={64} />
            <p className="text-[18px] leading-7 text-white">
              Feeling Valued. Dedicated to compassionate and personalized care for seniors
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-8 lg:w-auto lg:flex-row lg:items-start">
            <div className="grid grid-cols-2 gap-x-20 gap-y-9 pt-9">
              <div className="flex flex-col gap-5">
                {QUICK_LINKS_A.map((l) => (
                  <Link key={l.label} href={l.href} className="text-[18px] leading-7 text-[#e8e8e8] hover:text-white">
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-5">
                {QUICK_LINKS_B.map((l) => (
                  <Link key={l.label} href={l.href} className="text-[18px] leading-7 text-[#e8e8e8] hover:text-white">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-10 rounded-card bg-tertiary px-9 py-6 sm:w-[280px]">
              <div className="flex flex-col gap-2">
                <p className="font-serif text-[24px] leading-8 text-white">Follow Us</p>
                <p className="text-[18px] leading-7 text-white">
                  Head over to our social channels to stay up to date, and follow along with our upcoming events.
                </p>
              </div>
              <div className="flex w-full items-center justify-between">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="size-9"
                  >
                    <Image src={s.icon} alt="" width={36} height={36} aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/20 pt-6 text-[18px] leading-7 text-white sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} Serve Saathi</p>
          <p>
            All Rights Reserved |{" "}
            <Link href="/terms" className="text-tertiary hover:underline">
              Terms and Conditions
            </Link>{" "}
            |{" "}
            <Link href="/privacy" className="text-tertiary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
