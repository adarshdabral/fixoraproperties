"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMyProperties, submitPropertyForReview } from "@/services/property.service";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatPriceINR } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { Home } from "lucide-react";

const STATUS_VARIANT: Record<string, "neutral" | "gold" | "sage" | "warning" | "danger"> = {
  draft: "neutral",
  pending_review: "warning",
  published: "sage",
  rejected: "danger",
  sold: "gold",
  inactive: "neutral",
};

export default function SellerPropertiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["my-properties"], queryFn: listMyProperties });

  const handleSubmit = async (id: string) => {
    try {
      await submitPropertyForReview(id);
      toast({ variant: "success", title: "Submitted for review" });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    } catch (err) {
      toast({ variant: "error", title: "Couldn't submit", description: err instanceof ApiError ? err.message : undefined });
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState description="Couldn't load your properties." />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">My properties</h1>
        <Button asChild size="sm" variant="gold">
          <Link href="/seller/properties/new">List a property</Link>
        </Button>
      </div>

      <div className="mt-6">
        {data.properties.length === 0 ? (
          <EmptyState
            icon={<Home className="h-6 w-6" />}
            title="No properties yet"
            description="List your first property to start receiving enquiries through Fixora."
            action={
              <Button asChild size="sm">
                <Link href="/seller/properties/new">List a property</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {data.properties.map((property) => (
              <div key={property.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-line bg-white p-5">
                <div>
                  <p className="font-display text-lg text-ink">{property.title}</p>
                  <p className="text-sm text-ink-300">
                    {property.location.city}, {property.location.state} · {formatPriceINR(property.price.amount)}
                  </p>
                  {property.status === "rejected" && property.rejectionReason && (
                    <p className="mt-1 text-sm text-red-600">Rejected: {property.rejectionReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[property.status] ?? "neutral"}>{property.status.replace("_", " ")}</Badge>
                  {(property.status === "draft" || property.status === "rejected") && (
                    <Button size="sm" onClick={() => handleSubmit(property.id)}>
                      Submit for review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
