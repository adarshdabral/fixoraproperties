"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listShortlist, listMyInquiries } from "@/services/buyer.service";
import { LoadingState } from "@/components/ui/states";
import { StatCard } from "@/components/ui/stat-card";

export default function BuyerOverviewPage() {
  const shortlist = useQuery({ queryKey: ["shortlist"], queryFn: listShortlist });
  const inquiries = useQuery({ queryKey: ["my-inquiries"], queryFn: listMyInquiries });

  if (shortlist.isLoading || inquiries.isLoading) return <LoadingState />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Welcome back</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Shortlisted properties" value={shortlist.data?.properties.length ?? 0} />
        <StatCard label="Enquiries sent" value={inquiries.data?.inquiries.length ?? 0} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/properties" className="text-sm font-medium text-ink hover:text-gold-600">
          Browse properties →
        </Link>
        <Link href="/dashboard/shortlisted" className="text-sm font-medium text-ink hover:text-gold-600">
          View shortlist →
        </Link>
        <Link href="/dashboard/inquiries" className="text-sm font-medium text-ink hover:text-gold-600">
          View enquiries →
        </Link>
      </div>
    </div>
  );
}
