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

  // Accounts that predate joinedAt tracking backfill on their next login —
  // but the acting user is signed in *right now*, which is proof enough.
  // Stamp them here so their own row can never claim they haven't joined.
  if (!user.joinedAt) {
    await payload
      .update({
        collection: "users",
        id: user.id,
        data: { joinedAt: new Date().toISOString() },
      })
      .catch(() => {});
  }

  // showHiddenFields exposes resetPasswordExpiration so the row can say
  // whether a pending invite's link is still alive or needs re-minting.
  const { docs } = await payload.find({
    collection: "users",
    sort: "email",
    limit: 200,
    depth: 0,
    showHiddenFields: true,
  });

  const now = Date.now();
  const users = docs.map((u) => ({
    id: u.id,
    name: u.name || "",
    email: u.email,
    role: u.role || "editor",
    isSelf: String(u.id) === String(user.id),
    // Invite lifecycle: joined (completed /welcome or logged in) vs invited
    // with a live link vs invited with a dead one.
    joined: Boolean(u.joinedAt) || String(u.id) === String(user.id),
    inviteLinkAlive: Boolean(
      u.resetPasswordExpiration &&
        new Date(u.resetPasswordExpiration).getTime() > now
    ),
  }));

  return <UsersManager users={users} />;
}
