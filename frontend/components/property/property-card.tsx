"use client";

import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import type { PublicPropertyDTO } from "@/lib/shared/types";
import { Badge } from "@/components/ui/badge";
import { formatPriceINR, formatArea, categoryLabel, cn } from "@/lib/utils";
import { ShortlistButton } from "./shortlist-button";

export function PropertyCard({
  property,
  priority = false,
  initialShortlisted = false,
}: {
  property: PublicPropertyDTO;
  priority?: boolean;
  initialShortlisted?: boolean;
}) {
  const cover = property.media[0];

  return (
    <div className="group overflow-hidden rounded-xl2 border border-line bg-white shadow-card transition-shadow hover:shadow-lg">
      <Link href={`/properties/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt || property.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <span className="font-display text-sm">Fixora Properties</span>
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant="neutral" className="bg-white/90">
              {categoryLabel(property.category)}
            </Badge>
            {property.price.negotiable && <Badge variant="gold">Negotiable</Badge>}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/properties/${property.slug}`}>
            <h3 className="font-display text-lg leading-snug text-ink line-clamp-1">{property.title}</h3>
          </Link>
          <ShortlistButton propertyId={property.id} initialShortlisted={initialShortlisted} className="shrink-0" />
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-ink-300">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.location.city}, {property.location.state}
          </span>
        </p>

        <p className="mt-3 font-display text-xl text-ink">{formatPriceINR(property.price.amount)}</p>

        <div className="mt-3 flex items-center gap-4 text-sm text-ink-500">
          {property.specifications.bedrooms !== undefined && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {property.specifications.bedrooms}
            </span>
          )}
          {property.specifications.bathrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {property.specifications.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Ruler className="h-4 w-4" /> {formatArea(property.specifications.area, property.specifications.areaUnit)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className={cn("overflow-hidden rounded-xl2 border border-line bg-white")}>
      <div className="aspect-[4/3] w-full animate-pulse bg-ink/5" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-ink/5" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-ink/5" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-ink/5" />
      </div>
    </div>
  );
}

