"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROPERTY_CATEGORIES } from "@/lib/shared/types";
import { categoryLabel } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (category) params.set("category", category);
    router.push(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-xl2 border border-line bg-white p-3 shadow-card sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search className="h-5 w-5 shrink-0 text-ink-300" />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City — e.g. Chandigarh, Mumbai"
          className="border-none px-0 shadow-none focus-visible:ring-0"
          aria-label="City"
        />
      </div>

      <div className="h-px w-full bg-line sm:h-9 sm:w-px" />

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="h-11 border-none sm:w-48" aria-label="Property category">
          <SelectValue placeholder="Any category" />
        </SelectTrigger>
        <SelectContent>
          {PROPERTY_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {categoryLabel(c)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" variant="gold" size="lg" className="w-full sm:w-auto">
        Search properties
      </Button>
    </form>
  );
}
