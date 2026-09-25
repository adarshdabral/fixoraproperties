"use client";

import { api } from "@/lib/api";
import type { PropertyMediaInput } from "@/lib/shared/validation";

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
}

export function getUploadSignature() {
  return api.post<UploadSignature>("/media/signature");
}

/**
 * Uploads one image straight from the browser to Cloudinary using a
 * signature minted by our API — the file never passes through the backend.
 * XHR rather than fetch so we get upload progress events.
 */
export function uploadImageToCloudinary(
  file: File,
  sig: UploadSignature,
  onProgress: (percent: number) => void
): Promise<Pick<PropertyMediaInput, "url" | "publicId">> {
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  form.append("allowed_formats", sig.allowedFormats);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as { secure_url?: string; public_id?: string; error?: { message: string } };
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url && body.public_id) {
          resolve({ url: body.secure_url, publicId: body.public_id });
        } else {
          reject(new Error(body.error?.message ?? "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    xhr.send(form);
  });
}
