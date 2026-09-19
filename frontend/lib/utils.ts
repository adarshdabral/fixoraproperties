import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceINR(amount: number): string {
  if (amount >= 10000000) return `₹${trimDecimal(amount / 10000000)} Cr`;
  if (amount >= 100000) return `₹${trimDecimal(amount / 100000)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function trimDecimal(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatArea(area: number, unit: string): string {
  return `${area.toLocaleString("en-IN")} ${unit}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  land: "Land",
  plots: "Plots",
  apartments: "Apartments",
  villas: "Villas",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function titleCase(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
