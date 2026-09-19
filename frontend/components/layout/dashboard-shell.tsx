import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardShell({
  title,
  links,
  children,
}: {
  title: string;
  links: { href: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <div className="container-content grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="px-2 font-display text-lg text-ink">{title}</p>
        <nav className="mt-4 flex flex-row gap-1 overflow-x-auto lg:flex-col" aria-label="Dashboard">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
