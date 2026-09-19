import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { LEAD_SOURCES, LEAD_STATUSES } from "../../shared/types/index.js";

const noteSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },

    source: { type: String, enum: LEAD_SOURCES, required: true },
    requirements: { type: Schema.Types.Mixed, default: {} },

    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    notes: { type: [noteSchema], default: [] },
  },
  { timestamps: true }
);

export type LeadDocument = HydratedDocument<InferSchemaType<typeof leadSchema>>;
export const LeadModel = model("Lead", leadSchema);
