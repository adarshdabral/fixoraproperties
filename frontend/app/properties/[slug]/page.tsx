import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BedDouble, Bath, Ruler, Car, Building, MapPin, CalendarClock } from "lucide-react";
import { PropertyGallery } from "@/components/property/property-gallery";
import { EnquiryDialog } from "@/components/property/enquiry-dialog";
import { ShortlistButton } from "@/components/property/shortlist-button";
import { Badge } from "@/components/ui/badge";
import { getPropertyBySlug } from "@/services/property.server";
import { ApiError } from "@/lib/api-core";
import { formatPriceINR, formatArea, categoryLabel, titleCase } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadProperty(slug: string) {
  try {
    const { property } = await getPropertyBySlug(slug);
    return property;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await loadProperty(slug);
  if (!property) return { title: "Property not found" };

  const description = `${categoryLabel(property.category)} in ${property.location.city} — ${formatPriceINR(property.price.amount)}. ${property.description.slice(0, 140)}`;

  return {
    title: property.title,
    description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: property.title,
      description,
      images: property.media[0] ? [property.media[0].url] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await loadProperty(slug);
  if (!property) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location.city,
      addressRegion: property.location.state,
      postalCode: property.location.pincode,
    },
  };

  return (
    <div className="container-content py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <PropertyGallery media={property.media} title={property.title} />

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{categoryLabel(property.category)}</Badge>
                <Badge variant="neutral">{titleCase(property.listingType)}</Badge>
                {property.price.negotiable && <Badge variant="gold">Negotiable</Badge>}
                {property.featured && <Badge variant="sage">Featured</Badge>}
              </div>
              <h1 className="mt-3 font-display text-3xl text-ink">{property.title}</h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-ink-300">
                <MapPin className="h-4 w-4" />
                {property.location.address}, {property.location.city}, {property.location.state} —{" "}
                {property.location.pincode}
              </p>
            </div>
            <ShortlistButton propertyId={property.id} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-4">
            {property.specifications.bedrooms !== undefined && (
              <Spec icon={<BedDouble className="h-5 w-5" />} label="Bedrooms" value={String(property.specifications.bedrooms)} />
            )}
            {property.specifications.bathrooms !== undefined && (
              <Spec icon={<Bath className="h-5 w-5" />} label="Bathrooms" value={String(property.specifications.bathrooms)} />
            )}
            <Spec icon={<Ruler className="h-5 w-5" />} label="Area" value={formatArea(property.specifications.area, property.specifications.areaUnit)} />
            {property.specifications.parking !== undefined && (
              <Spec icon={<Car className="h-5 w-5" />} label="Parking" value={String(property.specifications.parking)} />
            )}
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl text-ink">About this property</h2>
            <p className="mt-3 whitespace-pre-line text-ink-500">{property.description}</p>
          </section>

          {property.amenities.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl text-ink">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="neutral">
                    {titleCase(amenity)}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow icon={<Building className="h-4 w-4" />} label="Construction" value={titleCase(property.constructionStatus)} />
            <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Possession" value={titleCase(property.possessionStatus)} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl2 border border-line bg-white p-6 shadow-card">
            <p className="font-display text-3xl text-ink">{formatPriceINR(property.price.amount)}</p>
            <p className="mt-1 text-sm text-ink-300">
              {property.price.negotiable ? "Price is negotiable" : "Fixed price"} · includes platform fee
            </p>

            <div className="mt-6">
              <EnquiryDialog propertyId={property.id} propertyTitle={property.title} />
            </div>

            <p className="mt-4 text-center text-xs text-ink-300">
              Your enquiry is reviewed by the Fixora team. We never share seller contact
              details directly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="text-ink-300">{icon}</span>
      <span className="font-medium text-ink">{value}</span>
      <span className="text-xs text-ink-300">{label}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-3">
      <span className="text-ink-300">{icon}</span>
      <div>
        <p className="text-xs text-ink-300">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
