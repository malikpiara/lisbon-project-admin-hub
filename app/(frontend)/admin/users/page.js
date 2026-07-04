import { redirect } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { UsersManager } from "./users-manager";

export const metadata = {
  title: "Team · Admin",
};

export default async function AdminUsersPage() {
  const { payload, user } = await authedPayload();
  // Team management is admin-only; editors don't see the nav item either.
  if (user.role !== "admin") redirect("/admin");

  const { docs } = await payload.find({
    collection: "users",
    sort: "email",
    limit: 200,
    depth: 0,
  });

  const users = docs.map((u) => ({
    id: u.id,
    name: u.name || "",
    email: u.email,
    role: u.role || "editor",
    isSelf: String(u.id) === String(user.id),
  }));

  return <UsersManager users={users} />;
}
