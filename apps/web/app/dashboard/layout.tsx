"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/shortlisted", label: "Shortlisted" },
  { href: "/dashboard/inquiries", label: "My enquiries" },
];

export default function BuyerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole roles={["BUYER"]}>
      <DashboardShell title="My Fixora" links={LINKS}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
