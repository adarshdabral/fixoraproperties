"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPlatformFee, setPlatformFee } from "@/services/admin.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";

/**
 * Sellers always enter and see their own ask price. This percentage is
 * added on top of that ask price wherever buyers see it (search results,
 * property pages) — see property.dto.ts#toPublicPropertyDTO on the API.
 */
export function PlatformFeeForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["platform-fee"], queryFn: getPlatformFee });
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setValue(String(data.platformFeePercent));
  }, [data]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const percent = Number(value);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      toast({ variant: "error", title: "Enter a percentage between 0 and 100" });
      return;
    }

    setSaving(true);
    try {
      await setPlatformFee(percent);
      await queryClient.invalidateQueries({ queryKey: ["platform-fee"] });
      toast({ variant: "success", title: `Platform fee set to ${percent}%` });
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't update platform fee",
        description: err instanceof ApiError ? err.message : "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading platform fee…" />;
  if (isError || !data) return <ErrorState description="Couldn't load the platform fee." />;

  const preview = Number(value);
  const hasValidPreview = Number.isFinite(preview) && preview >= 0;

  return (
    <form onSubmit={handleSubmit} className="max-w-sm rounded-xl2 border border-line bg-white p-6">
      <Label htmlFor="platform-fee">Platform fee (%)</Label>
      <div className="mt-1.5 flex items-center gap-3">
        <Input
          id="platform-fee"
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32"
        />
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <p className="mt-3 text-sm text-ink-300">
        Added on top of every seller&apos;s ask price wherever buyers see it. A ₹1,00,000 ask
        price {hasValidPreview ? `shows to buyers as ₹${Math.round(100000 * (1 + preview / 100)).toLocaleString("en-IN")}` : "is shown unchanged"} at
        this rate.
      </p>
    </form>
  );
}
