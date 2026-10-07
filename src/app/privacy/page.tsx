import type { Metadata } from "next";
import { Bullets, LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { GRIEVANCE_EMAIL, PRIVACY_NOTICE_VERSION } from "@/lib/consent";

export const metadata: Metadata = { title: "Privacy Notice · Serve Saathi" };

// Privacy Notice under the Digital Personal Data Protection Act, 2023 and
// DPDP Rules, 2025. Every in-form ConsentNotice links here.
//
// TODO(legal): written as a plain-language draft from how the site actually
// handles data today. Before launch, have counsel confirm the registered
// legal entity name, address, the named Grievance Officer, and retention
// periods — and bump PRIVACY_NOTICE_VERSION (src/lib/consent.ts) on any
// material change so stored consents point at the right version.

const UPDATED = new Date(PRIVACY_NOTICE_VERSION).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const mail = (
  <a href={`mailto:${GRIEVANCE_EMAIL}`} className="font-semibold text-primary underline">
    {GRIEVANCE_EMAIL}
  </a>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Notice"
      updated={UPDATED}
      intro={
        <>
          <p>
            ServeSaathi (&ldquo;we&rdquo;, &ldquo;us&rdquo;) helps families and seniors discover care providers. We
            are a <strong>discovery platform</strong>: we don&apos;t provide care ourselves, and we don&apos;t take
            bookings or payments for providers.
          </p>
          <p>
            This notice explains what personal data we collect, why, and the rights you have under India&apos;s
            Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;). We are the Data Fiduciary for the
            data described here. We ask for your consent at the point we collect your data, and only collect what
            that purpose needs.
          </p>
        </>
      }
    >
      <LegalSection title="1. What we collect, and why">
        <Bullets
          items={[
            <>
              <strong>Mobile number</strong> — to send a one-time password (OTP), verify it&apos;s you, and sign you
              in. Verifying unlocks the full provider list and side-by-side comparison.
            </>,
            <>
              <strong>Account details</strong> (name, email, password stored encrypted) — to create and run your
              account.
            </>,
            <>
              <strong>Callback requests</strong> (your name, mobile number, preferred day and time, any notes you add)
              — to pass your request to the one provider you chose so they can call you back.
            </>,
            <>
              <strong>Provider applications</strong> (organisation and contact-person details, registration numbers,
              documents) — to verify and list a provider.
            </>,
            <>
              <strong>Basic technical data</strong> (browser storage that keeps you signed in and remembers your
              compare list) — to make the site work. We don&apos;t use it for advertising.
            </>,
          ]}
        />
        <p>
          Please don&apos;t share medical records or health details in free-text notes. If a provider needs them, share
          them with the provider directly.
        </p>
      </LegalSection>

      <LegalSection title="2. Who we share it with">
        <Bullets
          items={[
            <>
              <strong>The provider you request a callback from</strong> — only the details in that request. After
              they contact you, the provider handles your data under their own privacy policy.
            </>,
            <>
              <strong>Service providers who run the platform for us</strong> (hosting, SMS/OTP delivery), under
              contract and only to do that work.
            </>,
            <>
              <strong>Authorities</strong>, only where the law requires it.
            </>,
          ]}
        />
        <p>We do not sell your personal data.</p>
      </LegalSection>

      <LegalSection title="3. How long we keep it">
        <p>
          We keep personal data only as long as the purpose needs it, then erase it — unless a law requires us to
          keep it longer. If you withdraw consent or close your account, we stop processing and erase the related
          data within a reasonable time, except what we must legally retain.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="4. Your rights">
        <p>Under the DPDP Act you can:</p>
        <Bullets
          items={[
            "Get a summary of the personal data we hold about you, how we use it, and who we have shared it with.",
            "Ask us to correct, complete, update or erase your personal data.",
            "Withdraw your consent at any time — it's as easy as giving it. Withdrawal doesn't affect processing already done, but we'll stop from then on (some features, such as the full provider list, need a verified number).",
            "Nominate someone to exercise these rights for you if you're unable to (for example, due to illness).",
            "Raise a grievance with us, and if it isn't resolved, complain to the Data Protection Board of India.",
          ]}
        />
        <p>
          To use any of these rights, write to {mail} from your registered email or mention your registered mobile
          number. We may need to confirm it&apos;s you before acting.
        </p>
      </LegalSection>

      <LegalSection id="grievance" title="5. Grievance Officer">
        <p>
          For questions or complaints about your personal data, contact our Grievance Officer at {mail}. We aim to
          respond within the time the DPDP Rules require. If you&apos;re not satisfied, you may approach the Data
          Protection Board of India.
        </p>
      </LegalSection>

      <LegalSection title="6. Children">
        <p>
          ServeSaathi is meant for adults. If you are under 18, please don&apos;t create an account or submit
          requests — ask a parent or guardian to do it with you.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We use reasonable security safeguards to protect your data, including encrypted connections and encrypted
          password storage. If a personal data breach affects you, we&apos;ll inform you and the Data Protection Board
          as the law requires.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes and languages">
        <p>
          If we change this notice in a way that matters, we&apos;ll update the date above and ask for your consent
          again where needed. You can ask for this notice in English or any language listed in the Eighth Schedule to
          the Constitution of India by writing to {mail}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
