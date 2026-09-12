import type { Metadata } from "next";
import { ModerationQueue } from "@/components/admin/moderation-queue";

export const metadata: Metadata = { title: "Property moderation" };

export default function AdminPropertiesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Property moderation</h1>
      <p className="mt-1 text-sm text-ink-300">Review and approve or reject properties submitted by sellers.</p>
      <div className="mt-6">
        <ModerationQueue />
      </div>
    </div>
  );
}
