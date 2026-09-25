"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users & Roles" },
  { href: "/admin/properties", label: "Property moderation" },
  { href: "/admin/inquiries", label: "Enquiries" },
];

/** The platform fee endpoints need SYSTEM_SETTINGS_MANAGE, which only SUPER_ADMIN holds. */
const SUPER_ADMIN_LINKS = [{ href: "/admin/settings", label: "Platform fee" }];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const links = user?.role === "SUPER_ADMIN" ? [...LINKS, ...SUPER_ADMIN_LINKS] : LINKS;

  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <DashboardShell title="Admin" links={links}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
