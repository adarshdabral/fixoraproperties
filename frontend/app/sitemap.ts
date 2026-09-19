import type { MetadataRoute } from "next";
import { searchProperties } from "@/services/property.server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/sell`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const { items } = await searchProperties({ limit: "50" });
    const propertyRoutes: MetadataRoute.Sitemap = items.map((property) => ({
      url: `${SITE_URL}/properties/${property.slug}`,
      lastModified: property.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    return [...staticRoutes, ...propertyRoutes];
  } catch {
    return staticRoutes;
  }
}
