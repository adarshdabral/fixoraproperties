import type { PropertyDocument } from "./property.model.js";
import type { PublicPropertyDTO, SellerPropertyDTO, AdminPropertyDTO, BrokerPropertyDTO } from "@fixora/types";

export type { PublicPropertyDTO, SellerPropertyDTO, AdminPropertyDTO, BrokerPropertyDTO };

/**
 * Property DTOs never include seller contact details (phone/email) —
 * those live on the User document and are only ever surfaced through
 * user.dto.ts to an audience authorized to see them (self, or staff via
 * USERS_VIEW). Keeping property and contact-info exposure in two separate
 * DTO layers means a future field added to Property can't accidentally
 * leak a seller's phone number through a property response.
 */
type BaseFields = PublicPropertyDTO;

/** Mongoose infers optional numeric subdocument fields as `T | null | undefined`; normalize null to undefined for the DTO's TS shape. */
function n<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

function baseFields(property: PropertyDocument): BaseFields {
  const location = property.location!;
  const price = property.price!;
  const specifications = property.specifications!;

  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    category: property.category,
    listingType: property.listingType,
    location: {
      address: location.address,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      coordinates: location.coordinates
        ? { lat: n(location.coordinates.lat), lng: n(location.coordinates.lng) }
        : undefined,
    },
    price: {
      amount: price.amount,
      currency: price.currency ?? "INR",
      negotiable: price.negotiable ?? false,
    },
    specifications: {
      bedrooms: n(specifications.bedrooms),
      bathrooms: n(specifications.bathrooms),
      area: specifications.area,
      areaUnit: specifications.areaUnit ?? "sqft",
      parking: n(specifications.parking),
      floor: n(specifications.floor),
      totalFloors: n(specifications.totalFloors),
    },
    amenities: property.amenities ?? [],
    media: (property.media ?? []).map((m) => ({ url: m.url, type: m.type, alt: m.alt ?? "", order: m.order ?? 0 })),
    constructionStatus: property.constructionStatus,
    possessionStatus: property.possessionStatus,
    featured: property.featured ?? false,
    createdAt: property.createdAt.toISOString(),
  };
}

export function toPublicPropertyDTO(property: PropertyDocument): PublicPropertyDTO {
  return baseFields(property);
}

export function toSellerPropertyDTO(property: PropertyDocument): SellerPropertyDTO {
  return {
    ...baseFields(property),
    sellerId: property.sellerId.toString(),
    status: property.status,
    rejectionReason: property.rejectionReason ?? null,
    viewCount: property.viewCount ?? 0,
    updatedAt: property.updatedAt.toISOString(),
  };
}
