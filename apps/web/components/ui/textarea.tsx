import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-300",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:border-ink-500",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
