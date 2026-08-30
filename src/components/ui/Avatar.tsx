import Image from "next/image";

// Circular profile photo with an initials fallback. Figma "Profile Photo"
// (used at 40px in the header, 64px in the dashboard greeting).

type AvatarProps = {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
};

function initials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function Avatar({ src, name, size = 40, className = "" }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-disabled font-semibold text-secondary ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden={name ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={name ? `${name}'s profile photo` : ""}
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export default Avatar;
