import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import {
  PROPERTY_CATEGORIES,
  PROPERTY_STATUSES,
  LISTING_TYPES,
  CONSTRUCTION_STATUSES,
  POSSESSION_STATUSES,
  AREA_UNITS,
} from "../../shared/types/index.js";

const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const propertySchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, maxlength: 5000 },

    propertyType: { type: String, required: true, trim: true },
    category: { type: String, enum: PROPERTY_CATEGORIES, required: true },
    listingType: { type: String, enum: LISTING_TYPES, required: true },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    price: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR" },
      negotiable: { type: Boolean, default: false },
    },

    specifications: {
      bedrooms: { type: Number, min: 0 },
      bathrooms: { type: Number, min: 0 },
      area: { type: Number, required: true, min: 0 },
      areaUnit: { type: String, enum: AREA_UNITS, default: "sqft" },
      parking: { type: Number, min: 0 },
      floor: { type: Number, min: 0 },
      totalFloors: { type: Number, min: 0 },
    },

    amenities: { type: [String], default: [] },
    media: { type: [mediaSchema], default: [] },

    constructionStatus: { type: String, enum: CONSTRUCTION_STATUSES, required: true },
    possessionStatus: { type: String, enum: POSSESSION_STATUSES, required: true },

    status: { type: String, enum: PROPERTY_STATUSES, default: "draft", index: true },
    rejectionReason: { type: String, default: null },
    featured: { type: Boolean, default: false, index: true },

    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ status: 1, category: 1, "location.city": 1 });
propertySchema.index({ "price.amount": 1 });
propertySchema.index({ "specifications.bedrooms": 1 });
propertySchema.index({ title: "text", description: "text" });

export type PropertyDocument = HydratedDocument<InferSchemaType<typeof propertySchema>>;
export const PropertyModel = model("Property", propertySchema);
