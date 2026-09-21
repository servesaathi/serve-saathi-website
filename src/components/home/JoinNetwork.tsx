import Image from "next/image";
import { Button } from "@/components/ui/Button";

// "08. Join Network" — Figma node 3395:29293.
const BENEFITS = [
  { title: "Grow your support network", body: "Keep notes, appointments and decisions in one gentle rhythm." },
  { title: "Discover trusted resources and services", body: "Clear answers from care guides, not a wall of jargon." },
  { title: "Build connections that can support your journey", body: "Your plan grows with your parent and with you." },
];

export function JoinNetwork() {
  return (
    <section className="rounded-2xl bg-bg-base py-10">
      <div className="mx-auto flex max-w-[1236px] flex-col items-start gap-12 px-8 lg:flex-row">
        <div className="flex w-full flex-col items-start gap-6 lg:flex-1">
          <h2 className="font-serif text-[32px] leading-[1.2] text-text-primary sm:text-[40px] sm:leading-[48px]">
            Join India&rsquo;s growing <span className="text-tertiary">elder care network</span>
          </h2>
          <p className="text-[18px] leading-7 text-text-secondary">
            Hospitals, home care agencies, diagnostic labs, and independent caregivers can reach
            families actively looking for trusted care with verified listings, and a provider
            dashboard built to help you grow.
          </p>

          <div className="flex w-full flex-col gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-border-hairline">
                  <Image src="/icons/homepage/benefit-bullet.svg" alt="" width={24} height={24} aria-hidden />
                </span>
                <div>
                  <p className="text-[18px] leading-7 font-semibold text-text-secondary">{b.title}</p>
                  <p className="text-[18px] leading-7 text-text-muted">{b.body}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            href="/join"
            className="mt-2"
            rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}
          >
            Join our partner network
          </Button>
        </div>

        <div className="relative aspect-[472/572] w-full overflow-hidden rounded-[24px] lg:flex-1">
          <Image
            src="/images/homepage/join-network.png"
            alt="A care provider reviewing a client's plan"
            fill
            sizes="(min-width: 1024px) 472px, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default JoinNetwork;
