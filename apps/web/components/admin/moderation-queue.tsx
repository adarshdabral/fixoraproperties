"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listPropertiesForModeration, approveProperty, rejectProperty } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { formatPriceINR } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { ClipboardCheck } from "lucide-react";

export function ModerationQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["moderation-queue"],
    queryFn: () => listPropertiesForModeration("pending_review"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["moderation-queue"] });

  const handleApprove = async (id: string) => {
    try {
      await approveProperty(id);
      toast({ variant: "success", title: "Property approved and published" });
      refresh();
    } catch (err) {
      toast({ variant: "error", title: "Couldn't approve", description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const handleReject = async (id: string) => {
    if (!reason.trim()) return;
    try {
      await rejectProperty(id, reason.trim());
      toast({ variant: "success", title: "Property rejected" });
      setRejectingId(null);
      setReason("");
      refresh();
    } catch (err) {
      toast({ variant: "error", title: "Couldn't reject", description: err instanceof ApiError ? err.message : undefined });
    }
  };

  if (isLoading) return <LoadingState label="Loading pending listings…" />;
  if (isError || !data) return <ErrorState description="Couldn't load the moderation queue." />;

  if (data.properties.length === 0) {
    return <EmptyState icon={<ClipboardCheck className="h-6 w-6" />} title="Nothing pending review" description="New submissions will appear here." />;
  }

  return (
    <div className="space-y-4">
      {data.properties.map((property) => (
        <div key={property.id} className="rounded-xl2 border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg text-ink">{property.title}</p>
              <p className="text-sm text-ink-300">
                {property.location.city}, {property.location.state} · {formatPriceINR(property.price.amount)}
              </p>
              <Badge variant="neutral" className="mt-2">
                {property.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleApprove(property.id)}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRejectingId(rejectingId === property.id ? null : property.id)}>
                Reject
              </Button>
            </div>
          </div>

          {rejectingId === property.id && (
            <div className="mt-4 flex gap-2 border-t border-line pt-4">
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection…"
                className="h-10 flex-1 rounded-md border border-ink/15 px-3 text-sm"
              />
              <Button size="sm" variant="destructive" onClick={() => handleReject(property.id)} disabled={!reason.trim()}>
                Confirm reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
