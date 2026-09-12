"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMyLeads, updateLeadStatus } from "@/services/broker.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { LEAD_STATUSES } from "@fixora/types";
import { titleCase } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { Inbox } from "lucide-react";

export default function BrokerLeadsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["my-leads"], queryFn: listMyLeads });

  const handleStatusChange = async (leadId: string, status: string) => {
    try {
      await updateLeadStatus(leadId, status);
      toast({ variant: "success", title: "Lead status updated" });
      queryClient.invalidateQueries({ queryKey: ["my-leads"] });
    } catch (err) {
      toast({ variant: "error", title: "Couldn't update lead", description: err instanceof ApiError ? err.message : undefined });
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState description="Couldn't load your leads." />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">My leads</h1>
      <div className="mt-6">
        {data.leads.length === 0 ? (
          <EmptyState icon={<Inbox className="h-6 w-6" />} title="No leads assigned yet" description="New enquiries assigned to you will appear here." />
        ) : (
          <div className="overflow-hidden rounded-xl2 border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-ink/[0.02] text-xs uppercase tracking-wide text-ink-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-3 text-ink">{titleCase(lead.source)}</td>
                    <td className="px-4 py-3 text-ink-300">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Select value={lead.status} onValueChange={(status) => handleStatusChange(lead.id, status)}>
                        <SelectTrigger className="h-9 w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {titleCase(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
