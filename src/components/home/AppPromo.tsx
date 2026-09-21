import Image from "next/image";

// "09. App" — Figma node 3395:29351. The store badges in Figma are built
// from masked vector groups (Apple/Google's official artwork composited
// per-platform); reproduced here as plain styled buttons with the same
// content/hierarchy rather than replicating the mask stack, since neither
// store listing exists yet to link to.
export function AppPromo() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-secondary py-10 pb-15">
      <Image
        src="/images/homepage/app-section-texture.png"
        alt=""
        aria-hidden
        fill
        className="pointer-events-none object-cover opacity-90"
      />
      <div className="relative mx-auto flex max-w-[1236px] flex-col items-center justify-center gap-12 px-8 lg:flex-row">
        <div className="flex w-full max-w-[408px] flex-col items-start gap-10">
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-[32px] leading-[1.2] text-white sm:text-[40px] sm:leading-[48px]">
              Your <span className="text-tertiary">care journey</span>,
              <br />
              wherever you are.
            </h2>
            <p className="text-[18px] leading-7 text-[#e8e8e8]">
              You can stay connected to the things that matter from everyday care to the next step
              in your journey from this app
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <span className="flex h-11 w-[148px] items-center gap-2 rounded-lg bg-white px-3 text-secondary" aria-disabled>
              <svg viewBox="0 0 24 24" className="size-6 fill-secondary" aria-hidden>
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.06 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>
                <span className="block text-[10px] leading-3">Download on the</span>
                <span className="block text-[16px] leading-5 font-semibold">App Store</span>
              </span>
            </span>
            <span className="flex h-11 w-[148px] items-center gap-2 rounded-lg bg-white px-3" aria-disabled>
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                <path fill="#00d2ff" d="M3 2.5c-.3.3-.5.8-.5 1.4v16.2c0 .6.2 1.1.5 1.4l.1.1L12.5 12v-.1L3.1 2.4z" />
                <path fill="#ff3a44" d="M15.6 15.1l-3.1-3.1v-.1l3.1-3.1 6.9 3.9c1 .5 1 1.4 0 1.9z" />
                <path fill="#ffdd00" d="M15.6 15.1L12.5 12 3.1 21.5c.4.4.9.4 1.6.1z" />
                <path fill="#00c46a" d="M15.6 8.8L4.7 2.4c-.7-.4-1.2-.3-1.6.1L12.5 12z" />
              </svg>
              <span>
                <span className="block text-[10px] leading-3">GET IT ON</span>
                <span className="block text-[16px] leading-5 font-semibold">Google Play</span>
              </span>
            </span>
          </div>
        </div>

        <div className="relative flex h-[280px] w-full max-w-[431px] items-center justify-center sm:h-[439px]">
          <div className="absolute h-[280px] w-[137px] rotate-[6deg] overflow-hidden rounded-2xl shadow-xl sm:h-[399px] sm:w-[195px]">
            <Image src="/images/homepage/app-screenshot-1.png" alt="Serve Saathi app screenshot" fill className="object-cover" />
          </div>
          <div className="absolute h-[280px] w-[137px] -translate-x-16 -rotate-[6deg] overflow-hidden rounded-2xl shadow-xl sm:h-[399px] sm:w-[195px] sm:-translate-x-28">
            <Image src="/images/homepage/app-screenshot-2.png" alt="Serve Saathi app screenshot" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default AppPromo;
