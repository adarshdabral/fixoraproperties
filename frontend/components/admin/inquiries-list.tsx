"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listInquiries, updateLeadStatus } from "@/services/admin.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/shared/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { titleCase } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export function InquiriesList() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin-inquiries"], queryFn: listInquiries });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Progressing the lead also updates the status the buyer sees on their dashboard.
  const handleStatusChange = async (inquiryId: string, leadId: string, status: LeadStatus) => {
    setPendingId(inquiryId);
    try {
      await updateLeadStatus(leadId, status);
      await queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast({ variant: "success", title: `Marked as ${titleCase(status).toLowerCase()}` });
    } catch (err) {
      toast({ variant: "error", title: "Couldn't update status", description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setPendingId(null);
    }
  };

  if (isLoading) return <LoadingState label="Loading enquiries…" />;
  if (isError || !data) return <ErrorState description="Couldn't load enquiries." />;

  if (data.inquiries.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-6 w-6" />}
        title="No enquiries yet"
        description="Enquiries buyers send from a property page will show up here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-ink/[0.02] text-xs uppercase tracking-wide text-ink-300">
          <tr>
            <th className="px-4 py-3 font-medium">Received</th>
            <th className="px-4 py-3 font-medium">Buyer</th>
            <th className="px-4 py-3 font-medium">Property</th>
            <th className="px-4 py-3 font-medium">Message</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line align-top">
          {data.inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td className="whitespace-nowrap px-4 py-3 text-ink-300">
                {new Date(inquiry.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {inquiry.buyer ? (
                  <>
                    <p className="font-medium text-ink">{inquiry.buyer.name}</p>
                    <p className="text-ink-300">{inquiry.buyer.email}</p>
                    <p className="text-ink-300">{inquiry.buyer.phone}</p>
                  </>
                ) : (
                  <span className="text-ink-300">Deleted account</span>
                )}
              </td>
              <td className="px-4 py-3">
                {inquiry.property ? (
                  <Link href={`/properties/${inquiry.property.slug}`} className="font-medium text-ink hover:text-gold-600" target="_blank">
                    {inquiry.property.title}
                  </Link>
                ) : (
                  <span className="text-ink-300">Deleted listing</span>
                )}
              </td>
              <td className="max-w-xs px-4 py-3 text-ink-500">{inquiry.message}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <Select
                  value={inquiry.status}
                  onValueChange={(v) => handleStatusChange(inquiry.id, inquiry.leadId, v as LeadStatus)}
                  disabled={pendingId === inquiry.id}
                >
                  <SelectTrigger className="h-9 w-40" aria-label="Enquiry status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {titleCase(s)}
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
  );
}
