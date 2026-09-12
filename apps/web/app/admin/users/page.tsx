import type { Metadata } from "next";
import { UserRoleManager } from "@/components/admin/user-role-manager";

export const metadata: Metadata = { title: "Users & Roles" };

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Users & Roles</h1>
      <p className="mt-1 text-sm text-ink-300">
        Look up a user by email and assign their role. Promoting to or from Admin/Super Admin
        requires a Super Admin account.
      </p>
      <div className="mt-6">
        <UserRoleManager />
      </div>
    </div>
  );
}
