"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { PrivateUserDTO, Role } from "@/lib/shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { searchUsers, changeUserRole, setUserActive } from "@/services/admin.service";
import { ApiError } from "@/lib/api";
import { Search } from "lucide-react";

const ADMIN_ASSIGNABLE_ROLES: Role[] = ["BUYER", "SELLER"];
const SUPER_ADMIN_ASSIGNABLE_ROLES: Role[] = ["BUYER", "SELLER", "ADMIN", "SUPER_ADMIN"];

/** Radix `Select.Item` rejects an empty-string value, so "all roles" uses this sentinel instead. */
const ALL_ROLES = "ALL";

const ROLE_FILTERS: { value: string; label: string }[] = [
  { value: ALL_ROLES, label: "All buyers & sellers" },
  { value: "BUYER", label: "Buyers only" },
  { value: "SELLER", label: "Sellers only" },
  { value: "ADMIN", label: "Admins only" },
  { value: "SUPER_ADMIN", label: "Super admins only" },
];

/**
 * Admin/super-admin UI for browsing every buyer and seller (full contact
 * details — name, email, phone, join date, status) and assigning their
 * role. Loads the most recent accounts on mount so admin never has to
 * search first to see who's on the platform; search/role-filter narrows
 * it further. The API enforces the real authorization boundary
 * (user.service#changeUserRole): only a super admin can touch the
 * ADMIN/SUPER_ADMIN tier. This component mirrors that boundary in the
 * options it offers so an admin never sees a choice the API will reject,
 * but the backend check is what actually matters — see docs/SECURITY.md.
 */
export function UserRoleManager() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL_ROLES);
  const [results, setResults] = useState<PrivateUserDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const assignableRoles =
    currentUser?.role === "SUPER_ADMIN" ? SUPER_ADMIN_ASSIGNABLE_ROLES : ADMIN_ASSIGNABLE_ROLES;

  const runSearch = async (search: string, role: string) => {
    setLoading(true);
    try {
      const { users } = await searchUsers(search, role === ALL_ROLES ? undefined : role);
      setResults(users);
    } catch (err) {
      toast({ variant: "error", title: "Search failed", description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  };

  // Show the most recent accounts by default, so admins can browse without searching first.
  useEffect(() => {
    runSearch("", ALL_ROLES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await runSearch(query, roleFilter);
  };

  const handleRoleFilterChange = async (value: string) => {
    setRoleFilter(value);
    await runSearch(query, value);
  };

  const handleRoleChange = async (targetUser: PrivateUserDTO, role: Role) => {
    if (role === targetUser.role) return;
    setPendingId(targetUser.id);
    try {
      const { user: updated } = await changeUserRole(targetUser.id, role);
      setResults((prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? null);
      toast({ variant: "success", title: `${updated.name} is now ${role}` });
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't change role",
        description: err instanceof ApiError ? err.message : "Something went wrong",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleActive = async (targetUser: PrivateUserDTO) => {
    setPendingId(targetUser.id);
    try {
      const { user: updated } = await setUserActive(targetUser.id, !targetUser.isActive);
      setResults((prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? null);
      toast({ variant: "success", title: updated.isActive ? "Account activated" : "Account deactivated" });
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't update account",
        description: err instanceof ApiError ? err.message : "Something went wrong",
      });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
          <SelectTrigger className="h-11 w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((option) => (
              <SelectItem key={option.value || "all"} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Loading…" />
        ) : !results || results.length === 0 ? (
          <EmptyState title="No users matched" />
        ) : (
          <div className="overflow-hidden rounded-xl2 border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-ink/[0.02] text-xs uppercase tracking-wide text-ink-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {results.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                      <td className="px-4 py-3 text-ink-500">{user.email}</td>
                      <td className="px-4 py-3 text-ink-500">{user.phone}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={user.role}
                          onValueChange={(role) => handleRoleChange(user, role as Role)}
                          disabled={isSelf || pendingId === user.id}
                        >
                          <SelectTrigger className="h-9 w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(assignableRoles.includes(user.role as Role)
                              ? assignableRoles
                              : [...assignableRoles, user.role as Role]
                            ).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isSelf && <p className="mt-1 text-xs text-ink-300">You can&apos;t change your own role</p>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(user)} disabled={isSelf || pendingId === user.id}>
                          <Badge variant={user.isActive ? "sage" : "danger"}>
                            {user.isActive ? "Active" : "Deactivated"}
                          </Badge>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
