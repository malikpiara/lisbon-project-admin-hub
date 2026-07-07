import { revalidatePath } from "next/cache";

// Revalidate every public route that renders CMS content, so an admin edit
// shows up on the live (statically-generated) site. Called by the content
// server actions after a write. It over-revalidates a little (a quick-access
// edit also refreshes the service pages), which is fine — content edits are
// infrequent, the site is small, and correctness beats precision here. The
// "page" form invalidates all instances of a dynamic route.
export function revalidatePublicContent() {
  revalidatePath("/"); // home: services grid, All Contacts, quick-access
  revalidatePath("/services"); // services index
  revalidatePath("/services/[slug]", "page"); // every category page
  revalidatePath("/services/[slug]/[topic]", "page"); // every article
}
