"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const LINKS = [
  { href: "/seller", label: "My properties" },
  { href: "/seller/properties/new", label: "List a property" },
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole roles={["SELLER"]}>
      <DashboardShell title="Seller" links={LINKS}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
