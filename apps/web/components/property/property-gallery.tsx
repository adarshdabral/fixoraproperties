"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import type { PropertyMediaDTO } from "@fixora/types";
import { cn } from "@/lib/utils";

export function PropertyGallery({ media, title }: { media: PropertyMediaDTO[]; title: string }) {
  const [active, setActive] = useState(0);

  if (media.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl2 bg-ink/5 text-ink-300">
        <Building2 className="h-10 w-10" />
      </div>
    );
  }

  const current = media[active]!;

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl2 bg-ink/5">
        <Image src={current.url} alt={current.alt || title} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
        {media.length > 1 && (
          <>
            <button
              onClick={() => setActive((i) => (i - 1 + media.length) % media.length)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActive((i) => (i + 1) % media.length)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-card"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {media.map((item, i) => (
            <button
              key={item.url + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-md border-2",
                i === active ? "border-gold" : "border-transparent"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={item.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
