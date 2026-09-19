"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users & Roles" },
  { href: "/admin/properties", label: "Property moderation" },
  { href: "/admin/inquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Platform fee" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <DashboardShell title="Admin" links={LINKS}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
