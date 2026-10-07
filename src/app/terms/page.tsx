import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { GRIEVANCE_EMAIL, PRIVACY_NOTICE_VERSION } from "@/lib/consent";

export const metadata: Metadata = { title: "Terms & Conditions · Serve Saathi" };

// Terms for ServeSaathi as a discovery-only platform (no bookings/payments).
// TODO(legal): plain-language draft — counsel to confirm the contracting
// entity, governing law/jurisdiction and liability wording before launch.

const UPDATED = new Date(PRIVACY_NOTICE_VERSION).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated={UPDATED}
      intro={
        <p>
          These terms apply when you use the ServeSaathi website. By creating an account or sending a request, you
          agree to them. How we handle your personal data is explained in our{" "}
          <Link href="/privacy" className="font-semibold text-primary underline">
            Privacy Notice
          </Link>
          .
        </p>
      }
    >
      <LegalSection title="1. What ServeSaathi is">
        <p>
          ServeSaathi is a <strong>discovery platform</strong>. We help you find and compare senior-care providers
          based on what you tell us you need. We do not provide care, and we do not take bookings or payments on
          behalf of any provider.
        </p>
        <Bullets
          items={[
            "When you “Request a Callback”, we pass your request to that provider. Whether and when they call is up to them.",
            "When you “Visit Website”, you leave ServeSaathi. The provider's own site and terms apply there.",
            "Any agreement about care, price or payment is directly between you and the provider.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Provider information">
        <p>
          Providers supply their own details (services, pricing, availability). We check providers before marking
          them &ldquo;Verified Partner&rdquo;, but we can&apos;t guarantee every detail is complete or current —
          please confirm anything important, especially prices and medical capabilities, with the provider before
          you decide.
        </p>
      </LegalSection>

      <LegalSection title="3. Your account">
        <Bullets
          items={[
            "Give accurate details, and keep your password and OTPs private.",
            "Only submit someone else's details (for example, a parent's) if you have their permission.",
            "Don't misuse the site — no spam requests, scraping, or attempts to break security.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Emergencies">
        <p>
          ServeSaathi is not an emergency service. In an emergency, call <strong>112</strong>.
        </p>
      </LegalSection>

      <LegalSection title="5. Liability">
        <p>
          Because we don&apos;t provide care or handle payments, we aren&apos;t responsible for the services a
          provider delivers or for disputes between you and a provider. Nothing in these terms limits rights you have
          under Indian consumer protection law.
        </p>
      </LegalSection>

      <LegalSection title="6. Changes and contact">
        <p>
          We may update these terms; the date above shows the latest version. Questions? Write to{" "}
          <a href={`mailto:${GRIEVANCE_EMAIL}`} className="font-semibold text-primary underline">
            {GRIEVANCE_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
