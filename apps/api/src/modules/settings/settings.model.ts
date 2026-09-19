import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/**
 * Singleton document (always looked up with no filter, upserted in place)
 * holding platform-wide configuration. Currently just the platform fee
 * percentage added on top of a seller's ask price for buyer-facing display —
 * see settings.service.ts.
 */
const platformSettingsSchema = new Schema(
  {
    platformFeePercent: { type: Number, required: true, min: 0, max: 100, default: 2 },
  },
  { timestamps: true }
);

export type PlatformSettingsDocument = HydratedDocument<InferSchemaType<typeof platformSettingsSchema>>;
export const PlatformSettingsModel = model("PlatformSettings", platformSettingsSchema);
