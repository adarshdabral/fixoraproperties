"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/shared/validation";
import { AuthShell, FieldError } from "@/components/auth/auth-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/services/auth.service";
import { ApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    try {
      await resetPassword(data);
      setDone(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid reset link">
        <p className="text-sm text-ink-300">
          This password reset link is missing its token. Please request a new one.
        </p>
        <Button asChild variant="primary" size="lg" className="mt-6 w-full">
          <Link href="/auth/forgot-password">Request a new link</Link>
        </Button>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <p className="text-sm text-ink-300">Your password has been reset. You can now log in with your new password.</p>
        <Button asChild variant="primary" size="lg" className="mt-6 w-full">
          <Link href="/auth/login">Go to log in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <input type="hidden" {...register("token")} />
        <div>
          <Label htmlFor="password">New password</Label>
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
        {serverError && (
          <p className="text-sm text-red-600" role="alert">
            {serverError}
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
