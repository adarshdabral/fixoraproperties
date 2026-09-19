import type { Metadata } from "next";
import { PlatformFeeForm } from "@/components/admin/platform-fee-form";

export const metadata: Metadata = { title: "Platform fee" };

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Platform fee</h1>
      <p className="mt-1 text-sm text-ink-300">
        Sellers set their own ask price. Buyers see that price marked up by this percentage —
        sellers still receive their full ask price. Only a Super Admin can change this.
      </p>
      <div className="mt-6">
        <PlatformFeeForm />
      </div>
    </div>
  );
}
