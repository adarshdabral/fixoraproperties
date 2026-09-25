import { PlatformSettingsModel } from "./settings.model.js";
import { recordAudit } from "../audit/audit.service.js";

const DEFAULT_FEE_PERCENT = 2;

/**
 * Sellers enter their ask price; buyers see ask price marked up by this
 * percentage (see property.dto.ts#toPublicPropertyDTO). There is always
 * exactly one settings document — upserted in place, never queried by id.
 */
export async function getPlatformFeePercent(): Promise<number> {
  const doc = await PlatformSettingsModel.findOne();
  return doc?.platformFeePercent ?? DEFAULT_FEE_PERCENT;
}

export async function setPlatformFeePercent(
  percent: number,
  actorId: string,
  req?: import("express").Request
): Promise<number> {
  const doc = await PlatformSettingsModel.findOneAndUpdate(
    {},
    { platformFeePercent: percent },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recordAudit({
    req,
    actorId,
    action: "PLATFORM_FEE_UPDATED",
    resourceType: "PlatformSettings",
    resourceId: doc.id,
    metadata: { platformFeePercent: doc.platformFeePercent },
  });

  return doc.platformFeePercent;
}

/** Applies the platform fee to a seller's ask price for buyer-facing display, rounded to the nearest whole currency unit. */
export function applyPlatformFee(amount: number, feePercent: number): number {
  return Math.round(amount * (1 + feePercent / 100));
}
