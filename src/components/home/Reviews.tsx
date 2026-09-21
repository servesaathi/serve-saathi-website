import Image from "next/image";

// "07. Reviews Comment" — Figma node 3395:29264. Only the "Parents / Senior"
// tab's content was in the design pull; the other two tabs are shown as
// designed but not wired to separate content yet.
const TABS = ["Parents / Senior", "Children", "Provider"];

const REVIEWS = [
  {
    quote: "“I feel independent yet cared for. My Saathi checks in and my children can see I’m well,  everyone is at peace.”",
    stars: 5,
    name: "Lata Krishnan, 62",
    role: "Senior member",
    place: "Chennai",
  },
  {
    quote: "“My daughter set up Serve Saathi for me. Now I get my medicines on time and a weekly call from my Saathi. I feel looked after, not managed.”",
    stars: 4,
    name: "Mr. Raghavan, 72",
    role: "Senior member",
    place: "Chennai",
  },
  {
    quote: "“Booking physiotherapy at home used to be a hassle. Now it takes two taps and someone reliable arrives.”",
    stars: 3,
    name: "Ramesh Gupta, 64",
    role: "Senior member",
    place: "Delhi",
  },
];

export function Reviews() {
  return (
    <section className="bg-bg-layout py-10">
      <div className="mx-auto flex max-w-[1236px] flex-col items-center gap-6 px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-serif text-[32px] leading-[1.2] text-text-primary sm:text-[40px] sm:leading-[48px]">
            Voices from the <span className="text-tertiary">Serve Saathi members</span>
          </h2>
          <p className="text-[18px] leading-7 text-text-secondary">
            Hear from the people who&rsquo;ve experienced the support, guidance, and care.
          </p>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6 px-4">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={`flex h-12 items-center rounded-input border-[1.5px] border-primary px-6 py-1 text-[16px] leading-[22px] ${
                i === 0 ? "bg-primary text-white" : "bg-border-hairline text-text-secondary"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="grid w-full grid-cols-1 gap-6 pt-8 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="relative flex flex-col gap-4 rounded-card bg-bg-base px-8 py-6">
              <Image
                src="/icons/homepage/quote-mark.svg"
                alt=""
                width={48}
                height={48}
                aria-hidden
                className="absolute -top-6 -left-6 hidden sm:block"
              />
              <p className="font-serif text-[18px] leading-6 text-text-secondary italic">{r.quote}</p>
              <div className="flex h-5 items-center gap-0.5">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Image key={i} src="/icons/homepage/star-a.svg" alt="" width={20} height={20} aria-hidden />
                ))}
              </div>
              <div className="text-[16px]">
                <p className="leading-[18px] font-semibold text-text-primary">{r.name}</p>
                <p className="leading-[18px] font-semibold text-text-muted">
                  {r.role} <span className="text-primary">·</span> {r.place}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-10 pt-4">
          <button
            type="button"
            aria-label="Previous review"
            className="flex h-12 items-center justify-center rounded-control bg-primary px-6"
          >
            <Image src="/icons/homepage/carousel-prev.svg" alt="" width={24} height={24} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next review"
            className="flex h-12 items-center justify-center rounded-control bg-primary px-6"
          >
            <Image src="/icons/homepage/carousel-next.svg" alt="" width={24} height={24} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
