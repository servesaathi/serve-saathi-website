import Link from "next/link";

// "Footer Light" (Account Dashboard variant) — Figma node 2108:20910.
// A single copyright bar: white, top hairline, copyright left / legal links right.
export function WebFooter() {
  return (
    <footer className="bg-bg-base">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-12">
        <div className="flex flex-col gap-2 border-t border-border-hairline py-6 text-[16px] leading-[30px] text-text-secondary sm:flex-row sm:items-center sm:justify-between sm:text-[18px]">
          <p>Copyright © {new Date().getFullYear()} Serve Saathi</p>
          <p>
            All Rights Reserved |{" "}
            <Link href="/terms" className="text-tertiary underline hover:no-underline">
              Terms and Conditions
            </Link>{" "}
            |{" "}
            <Link href="/privacy" className="text-tertiary underline hover:no-underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default WebFooter;
