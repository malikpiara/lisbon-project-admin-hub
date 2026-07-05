// Renders a JSON-LD structured-data block. Server-safe and hook-free, so it
// works inside server layouts/pages and lands in the initial HTML where crawlers
// and AI answer engines read it.
//
// The `<`/`>`/`&` escaping is defensive: our payloads are trusted constants
// today, but escaping means a future data-driven graph (e.g. article titles)
// can't break out of the <script> or inject markup. See lib/site for builders.
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- required for JSON-LD; content is escaped above
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
