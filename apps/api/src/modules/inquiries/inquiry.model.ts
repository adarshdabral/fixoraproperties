import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { LEAD_SOURCES, LEAD_STATUSES } from "@fixora/types";

const inquirySchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },

    message: { type: String, required: true, maxlength: 2000 },
    requirements: { type: Schema.Types.Mixed, default: {} },

    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    source: { type: String, enum: LEAD_SOURCES, required: true },

    /** Mirrors the linked Lead's status at time of read; the Lead is the source of truth (see lead.service.ts). */
    status: { type: String, enum: LEAD_STATUSES, default: "new" },
  },
  { timestamps: true }
);

export type InquiryDocument = HydratedDocument<InferSchemaType<typeof inquirySchema>>;
export const InquiryModel = model("Inquiry", inquirySchema);
