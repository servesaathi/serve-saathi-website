// "Download the app" — placeholder for now. The mobile app (React Native /
// Expo) ships later; the store buttons are non-interactive until then.

function StoreButton({ store, sub }: { store: string; sub: string }) {
  return (
    <span
      aria-disabled
      className="flex items-center gap-3 rounded-input border border-white/25 bg-white/10 px-5 py-3 text-white"
    >
      <span className="text-[11px] uppercase tracking-wide text-white/70">{sub}</span>
      <span className="text-[16px] font-semibold">{store}</span>
      <span className="rounded-full bg-tertiary px-2 py-0.5 text-[11px] font-semibold text-white">
        Soon
      </span>
    </span>
  );
}

export function AppDownload() {
  return (
    <section
      className="text-white"
      style={{ backgroundImage: "linear-gradient(140deg, #2e7d32 0%, #123214 100%)" }}
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-[560px]">
          <h2 className="text-[30px] leading-tight font-semibold sm:text-[36px]">
            Take ServeSaathi with you
          </h2>
          <p className="mt-3 text-[17px] leading-7 text-white/85">
            The ServeSaathi mobile app — with large text, high-contrast mode, and voice
            support — is on its way to the App Store and Google Play.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StoreButton store="App Store" sub="Download on the" />
          <StoreButton store="Google Play" sub="Get it on" />
        </div>
      </div>
    </section>
  );
}

export default AppDownload;
