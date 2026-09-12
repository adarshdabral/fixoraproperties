"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_CATEGORIES, LISTING_TYPES, CONSTRUCTION_STATUSES } from "@fixora/types";
import { categoryLabel, titleCase, cn } from "@/lib/utils";

const ANY = "__any__";

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [draft, setDraft] = useState(() => Object.fromEntries(searchParams.entries()));

  const setField = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const apply = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(draft)) {
      if (value && value !== ANY) params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setMobileOpen(false);
  };

  const clear = () => {
    setDraft({});
    router.push(pathname);
    setMobileOpen(false);
  };

  const fields = (
    <div className="space-y-5">
      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" className="mt-1.5" value={draft.city ?? ""} onChange={(e) => setField("city", e.target.value)} placeholder="e.g. Chandigarh" />
      </div>

      <div>
        <Label>Category</Label>
        <Select value={draft.category || ANY} onValueChange={(v) => setField("category", v)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any category</SelectItem>
            {PROPERTY_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Listing type</Label>
        <Select value={draft.listingType || ANY} onValueChange={(v) => setField("listingType", v)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Sale or rent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Sale or rent</SelectItem>
            {LISTING_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {titleCase(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="minPrice">Min price (₹)</Label>
          <Input id="minPrice" type="number" className="mt-1.5" value={draft.minPrice ?? ""} onChange={(e) => setField("minPrice", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="maxPrice">Max price (₹)</Label>
          <Input id="maxPrice" type="number" className="mt-1.5" value={draft.maxPrice ?? ""} onChange={(e) => setField("maxPrice", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="bedrooms">Min bedrooms</Label>
          <Input id="bedrooms" type="number" min={0} className="mt-1.5" value={draft.bedrooms ?? ""} onChange={(e) => setField("bedrooms", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bathrooms">Min bathrooms</Label>
          <Input id="bathrooms" type="number" min={0} className="mt-1.5" value={draft.bathrooms ?? ""} onChange={(e) => setField("bathrooms", e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Construction status</Label>
        <Select value={draft.constructionStatus || ANY} onValueChange={(v) => setField("constructionStatus", v)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any</SelectItem>
            {CONSTRUCTION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {titleCase(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-500">
        <input
          type="checkbox"
          checked={draft.negotiable === "true"}
          onChange={(e) => setField("negotiable", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-ink/20"
        />
        Negotiable only
      </label>

      <div className="flex gap-2 pt-2">
        <Button onClick={apply} className="flex-1">
          Apply filters
        </Button>
        <Button onClick={clear} variant="outline">
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <div className="rounded-xl2 border border-line bg-white p-5">{fields}</div>
      </div>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className={cn("fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-card lg:hidden")}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-lg text-ink">Filters</p>
                <button onClick={() => setMobileOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5 text-ink-300" />
                </button>
              </div>
              {fields}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
