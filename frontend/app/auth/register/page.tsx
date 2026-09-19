"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/shared/validation";
import { AuthShell, FieldError } from "@/components/auth/auth-shell";
import { RoleSelect } from "@/components/auth/role-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";

const DASHBOARD_PATH: Record<string, string> = {
  BUYER: "/dashboard",
  SELLER: "/seller",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: signUp } = useAuth();
  const { toast } = useToast();

  const preselectedRole = searchParams.get("role");
  const defaultRole = preselectedRole === "BUYER" || preselectedRole === "SELLER" ? preselectedRole : undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole as RegisterInput["role"] },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const user = await signUp(data);
      toast({ variant: "success", title: `Welcome to Fixora, ${user.name.split(" ")[0]}` });
      router.push(DASHBOARD_PATH[user.role] ?? "/");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast({ variant: "error", title: "Couldn't create your account", description: message });
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Join Fixora as a buyer or a seller."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-ink hover:text-gold-600">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <Label className="mb-2 block">I am signing up as</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSelect value={field.value} onChange={field.onChange} error={errors.role?.message} />
            )}
          />
        </div>

        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" className="mt-1.5" autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-1.5" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" type="tel" className="mt-1.5" autoComplete="tel" {...register("phone")} aria-invalid={Boolean(errors.phone)} />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className="mt-1.5"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
