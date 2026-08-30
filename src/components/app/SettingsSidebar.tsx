"use client";

import Image from "next/image";

// "Sidebar for Settings" — Figma node 1973:31204. Three grouped sections with
// an orange-tinted active row.

export type SettingsSection =
  | "edit-profile"
  | "change-password"
  | "payment"
  | "language"
  | "accessibility"
  | "privacy"
  | "notification"
  | "report"
  | "help"
  | "delete"
  | "logout";

const GROUPS: {
  heading: string;
  items: { key: SettingsSection; label: string; icon: string }[];
}[] = [
  {
    heading: "Account",
    items: [
      { key: "edit-profile", label: "Edit Profile", icon: "/icons/settings/edit-profile.svg" },
      { key: "change-password", label: "Change Password", icon: "/icons/settings/change-password.svg" },
      { key: "payment", label: "Payment Method", icon: "/icons/settings/payment.svg" },
    ],
  },
  {
    heading: "General",
    items: [
      { key: "language", label: "Language", icon: "/icons/settings/language.svg" },
      { key: "accessibility", label: "Accessibility", icon: "/icons/settings/accessibility.svg" },
      { key: "privacy", label: "Privacy Data", icon: "/icons/settings/privacy.svg" },
      { key: "notification", label: "Notification", icon: "/icons/settings/notification.svg" },
    ],
  },
  {
    heading: "Support",
    items: [
      { key: "report", label: "Report an issue", icon: "/icons/settings/report.svg" },
      { key: "help", label: "Help & Support", icon: "/icons/settings/help.svg" },
      { key: "delete", label: "Delete Account", icon: "/icons/settings/delete.svg" },
      { key: "logout", label: "Log out", icon: "/icons/settings/logout.svg" },
    ],
  },
];

type SettingsSidebarProps = {
  active: SettingsSection;
  onSelect: (key: SettingsSection) => void;
};

export function SettingsSidebar({ active, onSelect }: SettingsSidebarProps) {
  return (
    <nav className="flex w-full shrink-0 flex-col gap-6 self-start rounded-[12px] border border-[#e5e7eb] bg-bg-base p-4 lg:w-[220px]">
      {GROUPS.map((group) => (
        <div key={group.heading} className="flex flex-col gap-2">
          <p className="text-[18px] leading-6 font-semibold text-primary">{group.heading}</p>
          {group.items.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-[8px] p-2 text-left text-[16px] leading-[22px] font-medium transition-colors ${
                  isActive
                    ? "bg-bg-orange text-[#cc5e19]"
                    : "text-text-tertiary hover:bg-bg-layout hover:text-text-secondary"
                }`}
              >
                <Image src={item.icon} alt="" width={24} height={24} aria-hidden className="shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default SettingsSidebar;
