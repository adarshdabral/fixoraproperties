import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-paper px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-display text-xl font-semibold text-ink">
          Fixora <span className="text-gold">Properties</span>
        </Link>
        <div className="rounded-xl2 border border-line bg-white p-8 shadow-card">
          <h1 className="font-display text-2xl text-ink">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-ink-300">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-ink-300">{footer}</div>}
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}
