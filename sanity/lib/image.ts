import createImageUrlBuilder from "@sanity/image-url";

import { dataset, projectId } from "../env";

// The current content model has no images, but a real migration would (logos,
// hero art). This is the standard Sanity asset-URL helper, ready for that.
const builder = createImageUrlBuilder({ projectId, dataset });

// Derive the source type from the builder so we don't depend on a deep type path.
type ImageSource = Parameters<typeof builder.image>[0];

export function urlForImage(source: ImageSource) {
  return builder.image(source);
}
