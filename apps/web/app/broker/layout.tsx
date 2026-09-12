"use client";

import type { ReactNode } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const LINKS = [{ href: "/broker", label: "My leads" }];

export default function BrokerLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole roles={["BROKER"]}>
      <DashboardShell title="Broker" links={LINKS}>
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
