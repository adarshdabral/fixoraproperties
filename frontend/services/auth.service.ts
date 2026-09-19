"use client";

import { api } from "@/lib/api";
import type { PrivateUserDTO } from "@/lib/shared/types";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "@/lib/shared/validation";

export function registerAccount(input: RegisterInput) {
  return api.post<{ user: PrivateUserDTO }>("/auth/register", input);
}

export function login(input: LoginInput) {
  return api.post<{ user: PrivateUserDTO }>("/auth/login", input);
}

export function logout() {
  return api.post<null>("/auth/logout");
}

export function fetchCurrentUser() {
  return api.get<{ user: PrivateUserDTO }>("/auth/me");
}

export function forgotPassword(input: ForgotPasswordInput) {
  return api.post<null>("/auth/forgot-password", input);
}

export function resetPassword(input: ResetPasswordInput) {
  return api.post<null>("/auth/reset-password", input);
}
