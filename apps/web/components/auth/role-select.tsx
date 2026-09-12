"use client";

import { Home, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "BUYER" as const, label: "I'm a Buyer", description: "Looking to find and enquire about properties", icon: Home },
  { value: "SELLER" as const, label: "I'm a Seller", description: "Looking to list a property or land for sale", icon: Building2 },
];

/**
 * Deliberately has no default selection — the product requirement is that
 * a role must be actively chosen at signup, not silently defaulted. The
 * surrounding form's Zod schema (registerSchema) rejects submission with
 * no role, so this is enforced by validation, not just this component.
 */
export function RoleSelect({
  value,
  onChange,
  error,
}: {
  value: string | undefined;
  onChange: (value: "BUYER" | "SELLER") => void;
  error?: string;
}) {
  return (
    <div role="radiogroup" aria-label="I am signing up as a" aria-invalid={Boolean(error)}>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                selected ? "border-ink bg-ink/5" : "border-line hover:border-ink/30"
              )}
            >
              <Icon className={cn("h-5 w-5", selected ? "text-ink" : "text-ink-300")} />
              <span className="text-sm font-medium text-ink">{option.label}</span>
              <span className="text-xs text-ink-300">{option.description}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
