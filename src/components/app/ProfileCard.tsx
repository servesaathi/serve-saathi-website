import { Avatar } from "@/components/ui/Avatar";

// "Card View + Button" (Profile Card) — Figma node 2072:61304. Flat green
// banner + circle pattern (profile-card-pattern.svg), 72px avatar, name, and a
// "60 years old · Female" meta line with an orange dot separator.

type ProfileCardProps = {
  name: string;
  avatarUrl?: string | null;
  age?: number | null;
  gender?: string | null;
};

export function ProfileCard({ name, avatarUrl, age, gender }: ProfileCardProps) {
  const meta = [age != null ? `${age} years old` : null, gender || null].filter(
    (v): v is string => Boolean(v)
  );

  return (
    <div
      className="relative flex w-full max-w-[920px] items-center gap-4 overflow-hidden rounded-card p-4 text-white"
      style={{
        backgroundColor: "#2e7d32",
        backgroundImage: "url(/images/profile-card-pattern.svg)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
        backgroundSize: "auto 100%",
      }}
    >
      <Avatar src={avatarUrl ?? undefined} name={name} size={72} className="ring-2 ring-white/30" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-[22px] leading-tight font-semibold sm:text-[26px] lg:text-[30px]">
          {name}
        </p>
        {meta.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 text-[15px] sm:text-[18px]">
            {meta.map((m, i) => (
              <span key={m} className="flex items-center gap-1.5">
                {i > 0 && <span className="font-bold text-tertiary">·</span>}
                {m}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProfileCard;
