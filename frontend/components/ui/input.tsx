import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md border border-ink/15 bg-white px-3.5 text-sm text-ink placeholder:text-ink-300",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:border-ink-500",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
