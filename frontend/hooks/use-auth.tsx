"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { PrivateUserDTO } from "@/lib/shared/types";
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, registerAccount } from "@/services/auth.service";
import type { LoginInput, RegisterInput } from "@/lib/shared/validation";

interface AuthContextValue {
  user: PrivateUserDTO | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<PrivateUserDTO>;
  register: (input: RegisterInput) => Promise<PrivateUserDTO>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PrivateUserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: current } = await fetchCurrentUser();
      setUser(current);
    } catch {
      // Not logged in (401) or a transient network error — either way the
      // rest of the app just treats this as "no session".
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const { user: loggedIn } = await loginRequest(input);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: created } = await registerAccount(input);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
