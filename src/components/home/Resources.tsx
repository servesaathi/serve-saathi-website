import Image from "next/image";
import { Button } from "@/components/ui/Button";

// "06. Resources" — Figma node 3395:29238.
const ARTICLES = [
  {
    image: "/images/homepage/resource-article-1.png",
    featured: true,
    tag: "NUTRITION",
    title: "Managing diabetes in your 70s: a daily rhythm",
    meta: "Dr. Anjali Rao",
    metaExtra: "6 min read",
  },
  {
    image: "/images/homepage/resource-article-2.png",
    featured: false,
    tag: "MOVEMENT",
    title: "Gentle chair yoga for stiff mornings",
    meta: "12:30 PM",
    metaExtra: "Wellness Studio",
  },
];

export function Resources() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-secondary py-10 pb-15">
      <Image
        src="/images/homepage/resources-texture.png"
        alt=""
        aria-hidden
        fill
        className="pointer-events-none object-cover opacity-90"
      />
      <div className="relative mx-auto flex max-w-[1236px] flex-col gap-12 px-8">
        <h2 className="font-serif text-[32px] leading-[1.2] text-white sm:text-[40px] sm:leading-[48px]">
          Good information can feel like <span className="text-tertiary">care, too.</span>
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_300px]">
          {ARTICLES.map((a) => (
            <div key={a.title} className="flex flex-col overflow-hidden rounded-card">
              <div className="relative h-[180px] w-full">
                <Image src={a.image} alt="" fill className="object-cover" />
                {a.featured && (
                  <span className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-tertiary px-4 py-1 text-[14px] leading-5 text-white">
                    <Image src="/icons/homepage/featured-badge.svg" alt="" width={16} height={16} aria-hidden />
                    Featured
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-4 bg-bg-base p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-[16px] leading-5 text-primary">{a.tag}</p>
                  <h3 className="text-[24px] leading-8 font-semibold text-text-secondary">{a.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-[16px] leading-5 text-text-muted">
                  <Image src="/icons/homepage/clock.svg" alt="" width={20} height={20} aria-hidden />
                  <span>{a.meta}</span>
                  <span className="text-primary-pressed">·</span>
                  <span>{a.metaExtra}</span>
                </div>
                <button
                  type="button"
                  className="flex h-12 w-fit items-center justify-center rounded-control bg-primary px-3"
                  aria-label={`Read: ${a.title}`}
                >
                  <Image src="/icons/homepage/arrow-right-circle.svg" alt="" width={24} height={24} aria-hidden />
                </button>
              </div>
            </div>
          ))}

          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-8">
            <div>
              <span className="flex size-11 items-center justify-center rounded-full bg-tertiary">
                <Image src="/icons/homepage/guide-book.svg" alt="" width={20} height={20} aria-hidden />
              </span>
              <h3 className="pt-8 font-serif text-[24px] leading-8 text-white">
                Serve Saathi guide to planning well
              </h3>
              <p className="pt-2 text-[18px] leading-7 text-[#e8e8e8]">
                A warm, clear starting point for the questions that matter most.
              </p>
            </div>
            <Button
              href="/community"
              variant="hyperlink"
              className="!text-white"
              rightIcon={<Image src="/icons/homepage/arrow-right-circle.svg" alt="" width={24} height={24} />}
            >
              Get a guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resources;
