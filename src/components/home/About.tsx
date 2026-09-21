import Image from "next/image";
import { Button } from "@/components/ui/Button";

// "04. Assessment Section" — Figma node 3395:29180. Despite the Figma layer
// name (an artifact of the frame's build order), the content is an
// "About ServeSaathi" panel, not the Elder Wellbeing assessment flow.
const POINTS = [
  { icon: "/icons/homepage/about-bullet-1.svg", bg: "bg-border-hairline", text: "The important details are in one place." },
  { icon: "/icons/homepage/about-bullet-2.svg", bg: "bg-border-hairline", text: "Everyone knows who is doing what." },
  { icon: "/icons/homepage/about-bullet-3.svg", bg: "bg-orange-line", text: "You have a person to call when things shift." },
];

export function About() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-secondary py-15">
      <Image
        src="/images/homepage/about-section-texture.png"
        alt=""
        aria-hidden
        fill
        className="pointer-events-none object-cover opacity-90"
      />
      <div className="relative mx-auto flex max-w-[1236px] flex-col items-center gap-12 px-10 lg:flex-row lg:items-start">
        <div className="flex w-full min-w-0 flex-col items-start gap-6 pt-6 lg:max-w-[545px]">
          <h2 className="font-serif text-[32px] leading-[1.2] text-white sm:text-[40px] sm:leading-[48px]">
            About <span className="text-tertiary">ServeSaathi</span>
          </h2>
          <p className="text-[18px] leading-7 text-[#e8e8e8]">
            We are dedicated to delivering exceptional Senior care services with compassion and
            expertise. With a commitment to senior care, our team of professionals strives to
            provide comprehensive their personalized needs tailored to individual needs.
          </p>
          <Button
            href="/about"
            rightIcon={<Image src="/icons/homepage/arrow-right.svg" alt="" width={24} height={24} />}
          >
            Learn More
          </Button>
        </div>

        <div className="relative w-full pt-10 lg:w-[440px] lg:shrink-0 lg:pt-0">
          <div className="absolute top-[-44px] left-1/2 z-10 flex w-max -translate-x-1/2 items-center gap-3 rounded-card bg-primary p-4 lg:left-[234px] lg:translate-x-0">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-bg-layout">
              <Image src="/icons/homepage/invite-person.svg" alt="" width={24} height={24} aria-hidden />
            </span>
            <div>
              <p className="text-[14px] leading-5 whitespace-nowrap text-white">Plan with your family</p>
              <p className="text-[16px] leading-[22px] font-semibold whitespace-nowrap text-[#fffaf2]">
                Invite a loved one
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl bg-bg-layout p-6">
            <h3 className="max-w-[392px] text-[24px] leading-8 font-semibold text-text-primary">
              Clearer care.
              <br />
              Greater peace of mind.
            </h3>
            <div className="flex flex-col gap-4">
              {POINTS.map((p) => (
                <div key={p.text} className="flex items-center gap-3 rounded-card bg-bg-base p-3.5">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${p.bg}`}>
                    <Image src={p.icon} alt="" width={24} height={24} aria-hidden />
                  </span>
                  <p className="text-[16px] leading-6 text-text-secondary">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
