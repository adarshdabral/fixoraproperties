import { Schema, model } from "mongoose";
import { AUDIT_ACTIONS } from "../../shared/types/index.js";

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorRole: { type: String, default: null },
    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

export const AuditLogModel = model("AuditLog", auditLogSchema);
