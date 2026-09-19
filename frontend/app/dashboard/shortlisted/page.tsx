"use client";

import { useQuery } from "@tanstack/react-query";
import { listShortlist } from "@/services/buyer.service";
import { PropertyCard } from "@/components/property/property-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { Heart } from "lucide-react";

export default function ShortlistedPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["shortlist"], queryFn: listShortlist });

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState description="Couldn't load your shortlist." />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Shortlisted properties</h1>
      <div className="mt-6">
        {data.properties.length === 0 ? (
          <EmptyState icon={<Heart className="h-6 w-6" />} title="No shortlisted properties yet" description="Save properties you're interested in to find them here." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.properties.map((property) => (
              <PropertyCard key={property.id} property={property} initialShortlisted />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
