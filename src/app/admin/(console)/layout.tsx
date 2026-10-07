import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin · Serve Saathi", robots: { index: false, follow: false } };

// Every signed-in admin screen. /admin/login sits outside this group so it
// keeps the public PortalPage chrome and isn't caught by the guard.
export default function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
