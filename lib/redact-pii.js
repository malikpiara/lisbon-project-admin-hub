// Best-effort redaction of the most obvious direct identifiers (email, phone).
// A floor, not a guarantee — on a site serving vulnerable people, treat chatbot
// transcripts as special-category data and keep retention short regardless.
//
// Shared by BOTH ends so the "PII-redacted" promise holds end-to-end:
//   • the capture webhook redacts on WRITE (nothing unredacted is stored going
//     forward), and
//   • the insights reader redacts on READ (older or edge-case rows already in
//     PostHog are still masked before they reach a team member's screen).
// Redacting on read is the load-bearing one — it makes the guarantee true for
// whatever is already in the store, not just new captures.

/**
 * @param {unknown} text
 * @returns {string} the input with emails and phone numbers masked. Non-strings
 *   coerce to an empty string so a bad row can never leak a raw value.
 */
export function redactPII(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    // Phone: match a broad digits-and-separators run, but only redact when it
    // actually has phone-many digits (>= 9). Without that count the separator
    // class (space/dot/dash) also swallowed short amounts, dates and number
    // lists ("1.234.567", "10 - 20 - 30") — corrupting the transcripts the team
    // reads (this now also runs on read). No upper bound, so longer sensitive
    // numbers stay redacted.
    .replace(/\+?\d[\d\s().-]{7,}\d/g, (m) =>
      (m.match(/\d/g) || []).length >= 9 ? "[phone]" : m,
    );
}
