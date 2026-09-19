import type { Request } from "express";
import { AuditLogModel } from "./audit.model.js";
import type { AuditAction } from "../../shared/types/index.js";
import { logger } from "../../config/logger.js";

interface RecordAuditInput {
  req?: Request;
  actorId?: string | null;
  actorRole?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-log audit recording: failures here must never break the calling
 * business operation, so errors are caught and logged rather than thrown.
 */
export async function recordAudit(input: RecordAuditInput): Promise<void> {
  try {
    await AuditLogModel.create({
      actorId: input.actorId ?? input.req?.user?.id ?? null,
      actorRole: input.actorRole ?? input.req?.user?.role ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ?? {},
      ipAddress: input.req?.ip ?? null,
      userAgent: input.req?.get("user-agent") ?? null,
    });
  } catch (err) {
    logger.error({ err, action: input.action }, "Failed to record audit log");
  }
}
