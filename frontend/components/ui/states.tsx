import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-ink-300", className)} role="status">
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-line py-16 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink-300">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-300">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 rounded-xl2 border border-red-200 bg-red-50 py-16 text-center", className)}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-ink-300">{description}</p>
      </div>
      {action}
    </div>
  );
}
