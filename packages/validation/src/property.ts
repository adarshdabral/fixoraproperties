import { z } from "zod";
import {
  PROPERTY_CATEGORIES,
  LISTING_TYPES,
  CONSTRUCTION_STATUSES,
  POSSESSION_STATUSES,
  AREA_UNITS,
} from "@fixora/types";

const enumOf = <T extends readonly [string, ...string[]]>(arr: T) => z.enum(arr);

export const propertyLocationSchema = z.object({
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().regex(/^[0-9]{4,10}$/),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

export const propertyPriceSchema = z.object({
  amount: z.number().positive(),
  currency: z.literal("INR").default("INR"),
  negotiable: z.boolean().default(false),
});

export const propertySpecificationsSchema = z.object({
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  area: z.number().positive(),
  areaUnit: enumOf(AREA_UNITS as unknown as [string, ...string[]]).default("sqft"),
  parking: z.number().int().min(0).max(20).optional(),
  floor: z.number().int().min(0).max(200).optional(),
  totalFloors: z.number().int().min(0).max(200).optional(),
});

export const createPropertySchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(5000),
  propertyType: z.string().trim().min(2).max(50),
  category: enumOf(PROPERTY_CATEGORIES as unknown as [string, ...string[]]),
  listingType: enumOf(LISTING_TYPES as unknown as [string, ...string[]]),
  location: propertyLocationSchema,
  price: propertyPriceSchema,
  specifications: propertySpecificationsSchema,
  amenities: z.array(z.string().trim().max(50)).max(50).default([]),
  constructionStatus: enumOf(CONSTRUCTION_STATUSES as unknown as [string, ...string[]]),
  possessionStatus: enumOf(POSSESSION_STATUSES as unknown as [string, ...string[]]),
});
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export const updatePropertySchema = createPropertySchema.partial();
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

export const propertySearchSchema = z.object({
  q: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  category: enumOf(PROPERTY_CATEGORIES as unknown as [string, ...string[]]).optional(),
  listingType: enumOf(LISTING_TYPES as unknown as [string, ...string[]]).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  minArea: z.coerce.number().nonnegative().optional(),
  maxArea: z.coerce.number().nonnegative().optional(),
  constructionStatus: enumOf(CONSTRUCTION_STATUSES as unknown as [string, ...string[]]).optional(),
  negotiable: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(["newest", "price_asc", "price_desc", "area_asc", "area_desc"]).default("newest"),
});
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;
