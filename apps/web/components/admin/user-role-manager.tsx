"use client";

import { useState, type FormEvent } from "react";
import type { PrivateUserDTO, Role } from "@fixora/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { searchUsers, changeUserRole, setUserActive } from "@/services/admin.service";
import { ApiError } from "@/lib/api";
import { Search, UserCog } from "lucide-react";

const ADMIN_ASSIGNABLE_ROLES: Role[] = ["BUYER", "SELLER", "BROKER"];
const SUPER_ADMIN_ASSIGNABLE_ROLES: Role[] = ["BUYER", "SELLER", "BROKER", "ADMIN", "SUPER_ADMIN"];

/**
 * Admin/super-admin UI for looking a user up (by email — there's no
 * separate username field, email is the unique login identifier) and
 * assigning their role. The API enforces the real boundary
 * (user.service#changeUserRole): only a super admin can touch the
 * ADMIN/SUPER_ADMIN tier. This component mirrors that boundary in the
 * options it offers so an admin never sees a choice the API will reject,
 * but the backend check is what actually matters — see docs/SECURITY.md.
 */
export function UserRoleManager() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PrivateUserDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const assignableRoles =
    currentUser?.role === "SUPER_ADMIN" ? SUPER_ADMIN_ASSIGNABLE_ROLES : ADMIN_ASSIGNABLE_ROLES;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { users } = await searchUsers(query);
      setResults(users);
    } catch (err) {
      toast({ variant: "error", title: "Search failed", description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setLoading(false);
    }
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
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Searching…" />
        ) : results === null ? (
          <EmptyState
            icon={<UserCog className="h-6 w-6" />}
            title="Look up a user"
            description="Search by name or email to view and change their role."
          />
        ) : results.length === 0 ? (
          <EmptyState title="No users matched your search" />
        ) : (
          <div className="overflow-hidden rounded-xl2 border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-ink/[0.02] text-xs uppercase tracking-wide text-ink-300">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {results.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{user.name}</p>
                        <p className="text-ink-300">{user.email}</p>
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
