import Image from "next/image";

// "Rating stars" row from the compare table / review cards (Figma
// 3320:9895, 3337:166678): 20px orange stars, no gap.
export function RatingStars({ count, label }: { count: number; label?: string }) {
  return (
    <span role="img" aria-label={label ?? `${count} out of 5 stars`} className="flex h-5 items-center">
      {Array.from({ length: count }, (_, i) => (
        <Image key={i} src="/icons/services/star.svg" alt="" width={20} height={20} />
      ))}
    </span>
  );
}

export default RatingStars;
