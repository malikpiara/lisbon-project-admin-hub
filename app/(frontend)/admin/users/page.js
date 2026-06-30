import { authedPayload } from "@/lib/admin-auth";
import { UsersManager } from "./users-manager";

export const metadata = {
  title: "Team · Admin",
};

export default async function AdminUsersPage() {
  const { payload, user } = await authedPayload();

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
    isSelf: String(u.id) === String(user.id),
  }));

  return <UsersManager users={users} />;
}
