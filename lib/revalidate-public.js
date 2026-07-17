import { revalidatePath } from "next/cache";

// Revalidate every public route that renders CMS content, so an admin edit
// shows up on the live (statically-generated) site. Called by the content
// server actions after a write.
//
// WHY THE BLUNT `("/", "layout")` FORM — this is load-bearing, don't "optimise"
// it back into a list of per-route calls.
//
// revalidatePath builds its cache tag by raw string concatenation: the tag is
// "_N_T_" + path + "/" + type, with no normalisation. A page's own tags are
// derived from `workStore.page`, which is the *app-directory* path — route
// groups included. Our public routes live at app/(frontend)/(site)/..., so the
// article page's real tag is
//     _N_T_/(frontend)/(site)/services/[slug]/[topic]/page
// The obvious-looking revalidatePath("/services/[slug]/[topic]", "page") emits
//     _N_T_/services/[slug]/[topic]/page
// which matches nothing. It throws no error and returns no value, so the miss
// is completely silent — it shipped and stale articles served for days.
//
// `("/", "layout")` emits the tag "_N_T_/layout", and getDerivedTags() seeds
// every single page's tag list with "/layout" unconditionally. So it always
// matches, whatever the route groups are called. It invalidates more than
// strictly needed (the whole site, not just the edited article), which is the
// trade this file already made: content edits are infrequent, the site is
// small, and correctness beats precision. Re-render cost is a few DB reads on
// the next visit to each page.
//
// The precise alternative is to spell the route groups out
// ("/(frontend)/(site)/services/[slug]/[topic]", "page"), but that silently
// breaks again the moment a route group is renamed or a route moves — the same
// failure mode, with no test to catch it. Not worth it at this size.
export function revalidatePublicContent() {
  revalidatePath("/", "layout");
}
