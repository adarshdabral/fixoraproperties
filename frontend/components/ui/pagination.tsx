import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <PageLink href={buildHref(page - 1)} disabled={page <= 1} label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>
      <span className="px-3 text-sm text-ink-500">
        Page {page} of {totalPages}
      </span>
      <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-300/50" aria-hidden="true">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-500 hover:border-ink hover:text-ink")}
    >
      {children}
    </Link>
  );
}
