import type { Metadata } from "next";
import { Search } from "lucide-react";
import { FilterPanel } from "@/components/property/filter-panel";
import { PropertyCard } from "@/components/property/property-card";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { searchProperties } from "@/services/property.server";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse verified residential, commercial, and land listings on Fixora Properties.",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  let result;
  let loadError = false;
  try {
    result = await searchProperties(params);
  } catch {
    loadError = true;
  }

  const buildHref = (page: number) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string" && key !== "page") qs.set(key, value);
    }
    qs.set("page", String(page));
    return `/properties?${qs.toString()}`;
  };

  return (
    <div className="container-content py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Properties</h1>
          {result && <p className="mt-1 text-sm text-ink-300">{result.total} properties found</p>}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          <FilterPanel />
        </aside>

        <div>
          {loadError ? (
            <ErrorState description="We couldn't load properties right now. Please try again shortly." />
          ) : !result || result.items.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No properties found"
              description="Try adjusting your filters or search a different city."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((property, i) => (
                  <PropertyCard key={property.id} property={property} priority={i < 3} />
                ))}
              </div>
              <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
