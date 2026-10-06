import {
  HOME_PAGE_FIELDS,
  withHomePageDefaults,
} from "./home-page-defaults";

// Flatten the home-page global into readable plain text, in page order, for
// the review queue's word diff (same idea as flatten-topic.js). Blank-line
// separators keep the diff aligned field by field.

/** @param {any} doc */
export function flattenHomePage(doc) {
  const copy = withHomePageDefaults(doc);
  return HOME_PAGE_FIELDS.map((k) => copy[k].trim()).join("\n\n");
}
