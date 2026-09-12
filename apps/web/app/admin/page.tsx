"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/admin.service";
import { StatCard } from "@/components/ui/stat-card";
import { LoadingState, ErrorState } from "@/components/ui/states";

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin-dashboard"], queryFn: getDashboard });

  if (isLoading) return <LoadingState label="Loading dashboard…" />;
  if (isError || !data) return <ErrorState description="Couldn't load dashboard metrics." />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Overview</h1>

      <div className="mt-6">
        <p className="text-sm font-medium text-ink-500">Users</p>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total users" value={data.users.total} />
          <StatCard label="Buyers" value={data.users.buyers} />
          <StatCard label="Sellers" value={data.users.sellers} />
          <StatCard label="Brokers" value={data.users.brokers} />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-ink-500">Properties</p>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Active listings" value={data.properties.active} />
          <StatCard label="Pending review" value={data.properties.pending} />
          <StatCard label="Rejected" value={data.properties.rejected} />
          <StatCard label="Sold" value={data.properties.sold} />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-ink-500">Leads</p>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="New" value={data.leads.new} />
          <StatCard label="Qualified" value={data.leads.qualified} />
          <StatCard label="Negotiation" value={data.leads.negotiation} />
          <StatCard label="Converted" value={data.leads.converted} />
        </div>
      </div>
    </div>
  );
}
