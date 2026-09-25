import { serverApi } from "@/lib/api-server";
import type { PublicPropertyDTO } from "@/lib/shared/types";
import type { PaginatedResult } from "@/lib/shared/types";

export function searchProperties(query: Record<string, string | string[] | undefined>) {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") flat[key] = value;
  }
  return serverApi.get<PaginatedResult<PublicPropertyDTO>>("/properties", flat);
}

export function getPropertyBySlug(slug: string) {
  return serverApi.get<{ property: PublicPropertyDTO }>(`/properties/slug/${slug}`);
}

export function getFeaturedProperties(limit = 6) {
  return serverApi.get<PaginatedResult<PublicPropertyDTO>>("/properties", { featured: true, limit });
}

export function getPublicSettings() {
  return serverApi.get<{ platformFeePercent: number }>("/settings/public");
}
