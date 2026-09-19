"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@fixora/validation";
import { AuthShell, FieldError } from "@/components/auth/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";

const DASHBOARD_PATH: Record<string, string> = {
  BUYER: "/dashboard",
  SELLER: "/seller",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      const user = await login(data);
      const next = searchParams.get("next");
      router.push(next || DASHBOARD_PATH[user.role] || "/");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast({ variant: "error", title: "Couldn't log in", description: message });
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your Fixora account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-ink hover:text-gold-600">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-1.5" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-ink-300 hover:text-ink">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            className="mt-1.5"
            autoComplete="current-password"
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
