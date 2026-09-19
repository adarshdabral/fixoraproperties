export const PROPERTY_CATEGORIES = [
  "residential",
  "commercial",
  "land",
  "plots",
  "apartments",
  "villas",
] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];

export const PROPERTY_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "sold",
  "inactive",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const LISTING_TYPES = ["sale", "rent"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const CONSTRUCTION_STATUSES = ["ready_to_move", "under_construction", "new_launch"] as const;
export type ConstructionStatus = (typeof CONSTRUCTION_STATUSES)[number];

export const POSSESSION_STATUSES = ["immediate", "within_3_months", "within_6_months", "within_1_year", "later"] as const;
export type PossessionStatus = (typeof POSSESSION_STATUSES)[number];

export const AREA_UNITS = ["sqft", "sqyd", "sqm", "acre"] as const;
export type AreaUnit = (typeof AREA_UNITS)[number];
