import { PropertyModel } from "./property.model.js";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Appends a short random suffix and retries on the rare collision, so titles never need to be globally unique. */
export async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "property";

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 7);
    const candidate = `${base}-${suffix}`;
    const exists = await PropertyModel.exists({ slug: candidate });
    if (!exists) return candidate;
  }

  return `${base}-${Date.now()}`;
}
