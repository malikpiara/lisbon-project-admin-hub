<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Before you edit — gotchas

Full detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The four that bite hardest:

1. **One shared store.** `AdminProvider` wraps the whole app, so the public site and `/admin` read the same localStorage store via `useAdmin()`. `/admin` edits show on the public pages in the same browser — it is **not** isolated. The "static" public pages are client-rendered from localStorage.
2. **Non-standard radius scale** (`app/globals.css`): `rounded-lg`=16px, `rounded-xl`=24px, `rounded-2xl`=32px, `rounded-3xl`=**56px**. Cards are 16px (`rounded-lg`). Never use `rounded-3xl` on a card.
3. **`cn()` registers `text-ds-*` font sizes with tailwind-merge** (`lib/utils.js`). Don't revert to bare `twMerge` — it silently drops colour classes that collide with the custom sizes.
4. **`tone` is admin-only metadata** — it is not rendered as colour on the public site (uniform mint tiles). `tone` values are standard Tailwind palette names (`rose`, `teal`, …) used directly for the admin swatch; there is **no** `lib/admin-tones.js` hex map (that file does not exist).
