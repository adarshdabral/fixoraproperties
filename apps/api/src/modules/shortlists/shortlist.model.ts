import { Schema, model } from "mongoose";

const shortlistSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevents duplicate shortlist entries for the same buyer/property pair.
shortlistSchema.index({ buyerId: 1, propertyId: 1 }, { unique: true });

export const ShortlistModel = model("Shortlist", shortlistSchema);
