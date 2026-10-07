import Image from "next/image";
import Link from "next/link";

// "Back" hyperlink button above page titles (Figma 3318:97722): 24px arrow,
// primary 18/28 label.
export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 self-start rounded-control pr-4 text-[18px] leading-7 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Image src="/icons/services/back-arrow.svg" alt="" width={24} height={24} />
      {label}
    </Link>
  );
}

export default BackLink;
