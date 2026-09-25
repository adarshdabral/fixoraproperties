"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { addToShortlist, removeFromShortlist } from "@/services/buyer.service";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";

export function ShortlistButton({
  propertyId,
  initialShortlisted = false,
  className,
}: {
  propertyId: string;
  initialShortlisted?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [pending, setPending] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (user.role !== "BUYER") {
      toast({ variant: "error", title: "Only buyer accounts can shortlist properties" });
      return;
    }

    setPending(true);
    try {
      if (shortlisted) {
        await removeFromShortlist(propertyId);
        setShortlisted(false);
      } else {
        await addToShortlist(propertyId);
        setShortlisted(true);
        toast({ variant: "success", title: "Added to shortlist" });
      }
      queryClient.invalidateQueries({ queryKey: ["shortlist"] });
    } catch (err) {
      // Cards outside the shortlist page don't know what's already saved; a 409 means it already is.
      if (err instanceof ApiError && err.status === 409) {
        setShortlisted(true);
        return;
      }
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      toast({ variant: "error", title: "Couldn't update shortlist", description: message });
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-pressed={shortlisted}
      aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-300 transition-colors hover:text-red-500 disabled:opacity-50",
        shortlisted && "border-red-200 text-red-500",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", shortlisted && "fill-current")} />
    </button>
  );
}
