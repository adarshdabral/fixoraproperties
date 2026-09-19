"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPropertySchema, type CreatePropertyInput } from "@/lib/shared/validation";
import {
  PROPERTY_CATEGORIES,
  LISTING_TYPES,
  CONSTRUCTION_STATUSES,
  POSSESSION_STATUSES,
  AREA_UNITS,
} from "@/lib/shared/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/auth/auth-shell";
import { createProperty } from "@/services/property.service";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";
import { categoryLabel, titleCase } from "@/lib/utils";

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      amenities: [],
      price: { currency: "INR", negotiable: false, amount: 0 },
      specifications: { areaUnit: "sqft", area: 0 },
    },
  });

  const onSubmit = async (data: CreatePropertyInput) => {
    try {
      await createProperty(data);
      toast({ variant: "success", title: "Draft created", description: "Submit it for review when you're ready." });
      router.push("/seller");
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't create listing",
        description: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ink">List a property</h1>
      <p className="mt-1 text-sm text-ink-300">
        This creates a draft. Submit it for review once you&apos;re happy with the details — our
        team will review before it goes live.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
        <section className="space-y-4 rounded-xl2 border border-line bg-white p-5">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" className="mt-1.5" {...register("title")} placeholder="Spacious 3BHK in Sector 22" />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="mt-1.5" rows={4} {...register("description")} />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyType">Property type</Label>
              <Input id="propertyType" className="mt-1.5" {...register("propertyType")} placeholder="apartment, villa, plot…" />
              <FieldError message={errors.propertyType?.message} />
            </div>
            <div>
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {categoryLabel(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.category?.message} />
            </div>
          </div>

          <div>
            <Label>Listing type</Label>
            <Controller
              name="listingType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Sale or rent" />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {titleCase(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.listingType?.message} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl2 border border-line bg-white p-5">
          <p className="text-sm font-medium text-ink-500">Location</p>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" className="mt-1.5" {...register("location.address")} />
            <FieldError message={errors.location?.address?.message} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" className="mt-1.5" {...register("location.city")} />
              <FieldError message={errors.location?.city?.message} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" className="mt-1.5" {...register("location.state")} />
              <FieldError message={errors.location?.state?.message} />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" className="mt-1.5" {...register("location.pincode")} />
              <FieldError message={errors.location?.pincode?.message} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl2 border border-line bg-white p-5">
          <p className="text-sm font-medium text-ink-500">Price & specifications</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Price (₹)</Label>
              <Input id="amount" type="number" className="mt-1.5" {...register("price.amount", { valueAsNumber: true })} />
              <FieldError message={errors.price?.amount?.message} />
            </div>
            <label className="mt-8 flex items-center gap-2 text-sm text-ink-500">
              <input type="checkbox" className="h-4 w-4 rounded border-ink/20" {...register("price.negotiable")} />
              Price is negotiable
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" type="number" className="mt-1.5" {...register("specifications.area", { valueAsNumber: true })} />
              <FieldError message={errors.specifications?.area?.message} />
            </div>
            <div>
              <Label>Area unit</Label>
              <Controller
                name="specifications.areaUnit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" className="mt-1.5" {...register("specifications.bedrooms", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" className="mt-1.5" {...register("specifications.bathrooms", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="parking">Parking</Label>
              <Input id="parking" type="number" className="mt-1.5" {...register("specifications.parking", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Construction status</Label>
              <Controller
                name="constructionStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSTRUCTION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {titleCase(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.constructionStatus?.message} />
            </div>
            <div>
              <Label>Possession status</Label>
              <Controller
                name="possessionStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSSESSION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {titleCase(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.possessionStatus?.message} />
            </div>
          </div>
        </section>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating draft…" : "Create draft"}
        </Button>
      </form>
    </div>
  );
}
