import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { UsersManager } from "./users-manager";

export const metadata = {
  title: "Team · Studio (Payload)",
};

export default async function StudioUsersPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) {
    redirect("/cms-admin/login");
  }

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
