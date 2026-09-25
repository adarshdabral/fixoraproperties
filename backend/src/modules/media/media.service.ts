import crypto from "node:crypto";
import { env, integrations } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

/** Every property image lives under this Cloudinary folder; attach-time checks rely on it. */
export const PROPERTY_MEDIA_FOLDER = "fixora/properties";
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,avif";

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
}

/**
 * Browsers upload images straight to Cloudinary (so file bytes never pass
 * through this API, which caps bodies at 1mb) using a short-lived signature
 * minted here. The signature pins the folder and allowed formats, so a
 * client can't reuse it to upload elsewhere in the account or upload
 * non-image files. Cloudinary rejects signatures older than one hour.
 */
export function createUploadSignature(): UploadSignature {
  if (!integrations.media) {
    throw AppError.serviceUnavailable("Image uploads are not configured on this server");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary's signing scheme: params sorted by key, joined as a query string, then the secret appended.
  const toSign = `allowed_formats=${ALLOWED_FORMATS}&folder=${PROPERTY_MEDIA_FOLDER}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(toSign + env.CLOUDINARY_API_SECRET).digest("hex");

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    apiKey: env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder: PROPERTY_MEDIA_FOLDER,
    allowedFormats: ALLOWED_FORMATS,
  };
}

/**
 * The Zod schema only checks media URLs are Cloudinary URLs in general;
 * this narrows that to *our* cloud and *our* property folder, so a listing
 * can't be made to hotlink arbitrary images from someone else's account.
 */
export function assertPropertyMedia(media: { url: string; publicId: string }[] | undefined): void {
  if (!media || media.length === 0) return;
  if (!integrations.media) {
    throw AppError.serviceUnavailable("Image uploads are not configured on this server");
  }

  const urlPrefix = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  for (const item of media) {
    if (
      !item.url.startsWith(urlPrefix) ||
      !item.publicId.startsWith(`${PROPERTY_MEDIA_FOLDER}/`) ||
      !item.url.includes(item.publicId)
    ) {
      throw AppError.badRequest("One or more images were not uploaded through Fixora");
    }
  }
}
