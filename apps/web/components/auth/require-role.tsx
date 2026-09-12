"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/ui/states";
import type { ReactNode } from "react";

/**
 * Client-side route gating for UX only — every actual authorization
 * decision is re-checked server-side by the API (see docs/SECURITY.md,
 * "Never trust the frontend"). This just avoids flashing a dashboard the
 * user isn't allowed to use before the API rejects their requests.
 */
export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!roles.includes(user.role)) {
      router.replace("/");
    }
  }, [isLoading, user, roles, router, pathname]);

  if (isLoading || !user || !roles.includes(user.role)) {
    return <LoadingState label="Checking access…" className="min-h-[60vh]" />;
  }

  return <>{children}</>;
}
