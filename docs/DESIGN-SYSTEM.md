# Lisbon Project — Design System

> **Source of truth.** This document is reverse-engineered from the implemented
> code, which **is** the design system. Every value is taken from
> `app/globals.css`, `components/ui/*.tsx`, `components/icons/ds-icons.tsx`, and
> `lib/*`, and verified against the living style guide at **`/components`**. It
> mirrors the Figma file *"Lisbon-Project---DS" v11.06.2026* (file key
> `Fr0mUEYdhWhdoxPjHNPSaD`, owned by Rafael), but **the code is authoritative**.
>
> **Light-only in practice.** Dark mode is **fully defined** in `globals.css` (a
> 3-layer dark palette mirroring the Figma Dark mode) but **not wired to a toggle**,
> so the app always renders light. Only the `--chart-*` values remain legacy
> shadcn `oklch`.
>
> **Stack.** Next.js 16 (App Router) · React 19 · Tailwind v4 (`@theme inline`) ·
> Base UI primitives (`@base-ui/react/*`) · shadcn (base-nova) · `react-day-picker` v10.
> Tokens flow **Layer 1 primitives → Layer 2 semantic roles → shadcn aliases**;
> components reference semantic roles, never raw primitives.

---

## 1. Foundations

### 1.1 Color

All DS colors are plain hex/sRGB defined in `:root` in `app/globals.css`. The only
remaining `oklch()` values are the legacy shadcn `--chart-*` carry-overs, which are
**not** DS tokens (the `--sidebar-*` tokens are now remapped onto DS roles, and the
dark palette is real hex). Every token is registered as a Tailwind `--color-*` in
`@theme inline`, so `bg-brand-100`, `text-brand-800`, `border-brand-link`,
`text-project-education`, `bg-positive`, etc. all work.

#### Layer 1 — Brand ramp (a single teal ramp, dark → light)

| Token | Hex | Notes |
|---|---|---|
| `--brand-1000` | `#071817` | Deepest. Aliased `--brand-tertiary`, `--brand-deep`. |
| `--brand-900` | `#0A2422` | Active/press text on menus & ghost buttons. |
| `--brand-800` | `#083B37` | Tag text. |
| `--brand-700` | `#0A4D48` | Aliased `--brand-dark`; active button bg. |
| `--brand-600` | `#0D635D` | Aliased `--brand-link`; default link/ghost label, infobox border. |
| `--brand-500` | `#1F8E87` | **`--brand-primary`** — the core brand teal. |
| `--brand-400` | `#6ADCD5` | Selected-state borders (menu, checkbox secondary). |
| `--brand-300` | `#B3EFEB` | Aliased `--bg-mint`; secondary-button border. |
| `--brand-200` | `#D9F7F5` | Tag/secondary fills; `--accent`/`--border` alias. |
| `--brand-100` | `#F2FCFC` | **`--bg-primary`** / page background; service-icon tiles. |
| `--brand-000` | `#FFFFFF` | **`--brand-secondary`**; white surfaces. |

#### Layer 1 — Neutrals

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `--neutral-1000` | `#000000` | | `--neutral-500` | `#999999` |
| `--neutral-900` | `#1C1C1C` | | `--neutral-400` | `#BDBDBD` |
| `--neutral-800` | `#262626` | | `--neutral-300` | `#E3E3E3` |
| `--neutral-700` | `#383838` | | `--neutral-200` | `#F5F5F5` |
| `--neutral-600` | `#666666` | | `--neutral-100` | `#FFFFFF` |

Plus two standalone primitives: `--green: #72C549`, `--red: #D60000`.

#### Layer 1 — Project / program-area colors

One accent per Lisbon Project programme (Tailwind `--color-project-*`). **Not** the
same as the admin `tone` field (see §4).

| Token | Hex | Programme |
|---|---|---|
| `--project-social-care` | `#CC6300` | Social Care (orange) |
| `--project-people-culture` | `#B530B5` | People & Culture (magenta) |
| `--project-community-life` | `#DA2916` | Community Life (red) |
| `--project-education` | `#443FD9` | Education (violet) |
| `--project-employability` | `#006DBD` | Employability (blue) |

#### Layer 2 — Semantic roles

| Role | Resolves to | Hex |
|---|---|---|
| `--brand-primary` | `--brand-500` | `#1F8E87` |
| `--brand-secondary` | `--brand-000` | `#FFFFFF` |
| `--brand-tertiary` | `--brand-1000` | `#071817` |
| `--bg-primary` | `--brand-100` | `#F2FCFC` |
| `--bg-secondary` | `--neutral-100` | `#FFFFFF` |
| `--bg-tertiary` | `--brand-200` | `#D9F7F5` |
| `--text-primary` | `--neutral-900` | `#1C1C1C` |
| `--text-secondary` | `--neutral-700` | `#383838` |
| `--text-tertiary` | `--neutral-600` | `#666666` |
| `--positive` | `--green` | `#72C549` |
| `--negative` | `--red` | `#D60000` |

#### shadcn aliases (light-mode resolution)

The names most Tailwind utilities hit (`bg-card`, `border-border`, `text-muted-foreground`):

| Alias | Maps to | Effective hex |
|---|---|---|
| `--background` | `--bg-primary` | `#F2FCFC` |
| `--foreground` | `--text-primary` | `#1C1C1C` |
| `--card` / `--popover` | `--bg-secondary` | `#FFFFFF` |
| `--primary` | `--brand-primary` | `#1F8E87` |
| `--primary-foreground` | `--brand-secondary` | `#FFFFFF` |
| `--secondary` / `--accent` / `--border` | `--bg-tertiary` | `#D9F7F5` |
| `--accent-foreground` | `--brand-primary` | `#1F8E87` |
| `--muted-foreground` | `--text-tertiary` | `#666666` |
| `--destructive` | `--negative` | `#D60000` |
| `--input` | `--neutral-300` | `#E3E3E3` |
| `--ring` | `--brand-primary` | `#1F8E87` |
| `--radius` | — | `1rem` (16px) base |

> `--chart-1…5` and `--sidebar-*` are generic shadcn `oklch` greys, unused by the DS.

### 1.2 Typography

**Family — Quicksand for everything** (Google font via `next/font`, CSS var
`--font-quicksand`; variable font, weights 300–700). `--font-sans` and
`--font-heading` both resolve to Quicksand. JetBrains Mono (`--font-mono`) is used
only in API-reference tables and code blocks.

**Default body weight = 500 (medium).** `body { font-weight: 500 }` — a deliberate
deviation from the usual 400. Titles/labels/buttons/tags step up to `font-bold` (700).

**Responsive type scale** — nine steps, each a font-size paired with a line-height
in `@theme inline`, fluid across four breakpoints (Base `<768`, `≥768`, `≥1280`,
`≥1680`). Values in rem (px in parens):

| Step | Base | ≥768 | ≥1280 | ≥1680 |
|---|---|---|---|---|
| `ds-xxxxl` | 1.875/1.875 (30/30) | 2.6875/2.9375 (43/47) | 3.6875/3.8125 (59/61) | 3.75/3.875 (60/62) |
| `ds-xxxl` | 1.5625/1.875 (25/30) | 2.0625/2.25 (33/36) | 2.625/2.875 (42/46) | 2.625/2.9375 (42/47) |
| `ds-xxl` | 1.5/1.625 (24/26) | 1.9375/2.375 (31/38) | 2.5/2.75 (40/44) | 2.5/3 (40/48) |
| `ds-xl` | 1.375/1.5 (22/24) | 1.75/2 (28/32) | 1.75/2.25 (28/36) | 1.75/2.25 (28/36) |
| `ds-l` | 1.1875/1.4375 (19/23) | 1.25/1.5625 (20/25) | 1.375/1.625 (22/26) | 1.375/1.625 (22/26) |
| `ds-m` | 1.0625/1.375 (17/22) | 1.0625/1.375 (17/22) | 1.125/1.4375 (18/23) | 1.125/1.5625 (18/25) |
| `ds-s` | 1/1.5 (16/24) | 1/1.5 (16/24) | 1/1.4375 (16/23) | 1/1.4375 (16/23) |
| `ds-xs` | 0.9375/1.25 (15/20) | 0.9375/1.25 (15/20) | 0.9375/1.375 (15/22) | 0.9375/1.375 (15/22) |
| `ds-xxs` | 0.8125/1.125 (13/18) | (same) | (same) | (same) |

**Usage convention:** page titles `text-ds-xxxxl`; section titles `text-ds-xxl`/`xxxl`;
card/lead `text-ds-l`/`m`; body & form controls `text-ds-xs` (15px); tags, breadcrumbs,
list rows, infobox, accordion body `text-ds-xxs` (13px); `text-ds-s` (16px) is the base
interactive label.

### 1.3 Radii — **non-standard scale (this bites)**

| Token | Value | px | Used for |
|---|---|---|---|
| `--radius-sm` | 0.25rem | **4px** | checkbox box (`rounded-sm`) |
| `--radius-md` | 0.5rem | **8px** | rare (e.g. password-toggle button) |
| `--radius-lg` | 1rem | **16px** | **button, input, tag base, card, infobox, select trigger/menu** |
| `--radius-xl` | 1.5rem | **24px** | calendar container; select **item** |
| `--radius-2xl` | 2rem | **32px** | hero icon tile, photo gallery (desktop) |
| `--radius-3xl` | 3.5rem | **56px** | section panel |
| `--radius-4xl` | 3.5rem | **56px** | cap (same as 3xl) |

Pills (Tag, number badge, radio) use `rounded-full`. **`rounded-lg` = 16px (not
Tailwind's 8px); `rounded-3xl` = 56px. Cards are 16px — never `rounded-3xl` on a card.**

### 1.4 Spacing

No bespoke spacing scale — Tailwind's default 4px utilities. Two conventions:
- **Borders are 2px everywhere** (`border-2`) — cards, inputs, selects, buttons,
  checkboxes, radios, tags, infobox, accordion dividers, table rows, calendar. 1px
  borders are essentially absent. Separation is carried by 2px borders + mint/white
  contrast, **not** shadows.
- **Section padding helpers** (`app/globals.css`): `.ds-section-padding`,
  `.ds-section-padding-compact`, `.ds-section-x-padding` (responsive,
  base `4rem 1.5rem` → up to `8.4rem` inline / `8.75rem` block at ≥1680).
- **Card internal padding** steps up at xl: `px-4 → xl:px-6`; `size="sm"` → `px-3`.

### 1.5 Shadows

The DS is almost flat — no shadow token scale. Shadows appear only on the select
popover (`shadow-md`) and the decorative styleguide-card hover.

---

## 2. Components

All in `components/ui/*.tsx`, using `cn()`, built on Base UI primitives unless noted.
Button and Checkbox use a CVA variant API.

- **Button** (`button.tsx`) — base `rounded-lg border-2 text-ds-s font-bold`, focus
  `ring-3 ring-ring/35`, active `translate-y-px`. **7 variants:** `default`
  (`bg-primary`/white, hover `brand-600`, active `brand-700`), `secondary` (white,
  `border-brand-300`, teal label), `ghost` (`text-brand-link`), `menu` (nav item;
  selected = white bg + `border-brand-400`), `outline`, `destructive`, `link`.
  **8 sizes:** `default` (h-11), `sm` (h-10), `xs` (h-8), `lg`, `icon`, `icon-lg`,
  `icon-sm`, `icon-xs`. `buttonVariants` is exported and reused.
- **Card** (`card.tsx`) — root `rounded-lg border-2 border-border bg-card py-4
  text-ds-xs` (`xl:py-6`), prop `size: default|sm`. Sub-parts: `CardHeader`,
  `CardTitle` (`font-heading text-ds-s font-bold`), `CardDescription`, `CardAction`,
  `CardContent`, `CardFooter`. Three composites: **`CardService`** (horizontal row;
  `size-16 rounded-lg bg-brand-100` icon tile + title/desc + `IconArrowRight`),
  **`CardShortcut`** (vertical; big `text-bg-mint` icon + action button),
  **`CardSchedule`** (clock-header + rows + optional `Infobox` footer).
- **Select** (`select.tsx`) — `SelectTrigger` `rounded-lg border-2 border-input
  bg-card text-ds-xs font-bold`; states hover `border-muted-foreground
  bg-neutral-200`, active `border-foreground`, focus `border-ring`. `SelectContent`
  `rounded-lg border-2 bg-popover shadow-md`. `SelectItem` `rounded-xl` (24px), focus
  `bg-accent text-accent-foreground` (mint). **Gotcha:** item `value` doubles as the
  visible label (Base UI shows raw value otherwise); `onValueChange` → `string|null`.
- **Input** (`input.tsx`) — `h-11 rounded-lg border-2 border-input bg-card text-ds-xs
  font-bold`. Affixes: `InputSearch` (leading `IconSearch`), `InputPassword` (eye toggle).
- **Textarea** (`textarea.tsx`) — `field-sizing-content min-h-20 rounded-lg border-2`.
- **Checkbox** (`checkbox.tsx`) — `size-6 rounded-sm (4px) border-2`, two variants:
  `primary` (neutral, checked → white + `brand-link` check), `secondary` (mint).
- **Radio** (`radio-group.tsx`) — `size-6 rounded-full border-2`, checked = `brand-link`.
- **Tag** (`tag.tsx`) — the single category chip (no Badge): `rounded-full border-2
  border-secondary text-ds-xxs font-bold text-brand-800`.
- **Infobox** (`infobox.tsx`) — `rounded-lg border-2 border-brand-link bg-secondary`,
  faded info icon + bold title + medium description + optional action.
- **Accordion** (`accordion.tsx`) — `border-b-2` items; trigger with optional number
  badge + `Tag` + `+/−` (`IconPlus`/`IconMinus`); animated content panel.
- **Breadcrumb** (`breadcrumb.tsx`) — `text-ds-xxs font-bold`, link `text-primary`,
  current page `text-brand-deep`.
- **List Item** (`list-item.tsx`) — schedule/detail rows: `border-b-2 py-4`, icon
  `text-primary`, subtitle (bold, left) + value (medium, right).
- **Text Block** (`text-block.tsx`) — section-body: category chip + `h2 font-heading
  text-ds-xxxl` title + `text-ds-m` lead + `text-ds-xs` body.
- **Photo Gallery** (`photo-gallery.tsx`) — full-bleed images, responsive height
  (227→410px) and radius (16→32px), `secondary` icon-button nav.
- **Calendar** (`calendar.tsx`) — `react-day-picker` v10, `rounded-xl border-2`,
  Monday-start, today = neutral outline, selected = teal outline + mint fill, event = teal dot.
- **Table** (`table.tsx`) — `border-b-2` rows (hover `bg-muted/50`), `text-ds-xs`,
  bold muted headers.
- **Collapsible** (`collapsible.tsx`) — **unstyled** Base UI pass-through (the DS has
  no styled Collapsible; Accordion is the styled disclosure).
- **Icon** (`icon.tsx`) — `<Icon name="…">` looks up raw SVG in `DS_ICONS` (see §3).

---

## 3. Icon System

**Two parallel mechanisms**, both monochrome via `currentColor` (the parent's text
color drives the glyph), exported from Rafael's Figma DS (iconography node `2278:5604`):

- **(A) Named React components — `components/icons/ds-icons.tsx` (35 exports).**
  Tree-shakeable inline `<svg>` components used directly by the UI primitives, e.g.
  `IconArrowRight`, `IconCheck`, `IconPlus`/`IconMinus`, `IconSearch`, `IconInfo`,
  `IconMail`, `IconPhone`, `IconArrowDown/Left`, `IconEyeOpen/Closed`, `IconMenu`,
  plus domain icons (`IconHome`, `IconSchool`, `IconLegal`, `IconHealthChart`, …).
- **(B) String-keyed registry — `lib/ds-icons-data.ts` (`DS_ICONS`, 81 icons)** +
  manifest `lib/ds-icons.json`. Auto-generated from `public/icons/*.svg`, consumed by
  `<Icon name>` and the searchable styleguide gallery (kebab-case names).
- **(C) Service-icon mapping — `lib/service-icons.js`** maps mock-CMS `iconKey`
  values (e.g. `GraduationCap`) + per-slug overrides to the named (A) components,
  fallback `IconBuilding`.

`lucide-react` is used **only** in styleguide chrome — it is **not** part of the DS.

---

## 4. Usage Rules & Gotchas

1. **Radius scale is non-standard.** `rounded-lg`=16px, `xl`=24px, `2xl`=32px,
   `3xl`=**56px**. Cards/buttons/inputs are `rounded-lg`. **Never `rounded-3xl` on a card.**
2. **`cn()` registers `text-ds-*` with tailwind-merge** (`lib/utils.js`,
   `extendTailwindMerge`). Without it, tailwind-merge can't tell `text-ds-xs` (size)
   from `text-primary-foreground` (color) and **silently drops one** (this once turned
   white button labels dark). **Do not revert `cn()` to bare `twMerge`.**
3. **Borders are 2px, not 1px.** Surfaces separate via `border-2` + mint/white contrast, not shadows.
4. **Default text weight is 500 (medium), not 400** (set on `body`). Titles/labels/buttons step to 700.
5. **`tone` is admin-only metadata, not rendered on the public site.** Services carry
   a `tone` (`toneOptions`: `rose, teal, violet, pink, emerald, cyan, orange, blue` —
   these are **standard Tailwind palette names**) and an `iconKey`, both in
   `lib/admin-default-data.js`. Public service cards render a **uniform mint tile**
   (`bg-secondary`), ignoring `tone`. **Correction:** earlier docs referenced a
   `lib/admin-tones.js` hex map — **that file does not exist**; there is no tone→hex
   map in code, and `tone` is a bare palette-name string. Do not confuse the `tone`
   palette names with the DS **`--project-*`** program-area colors (§1.1).
6. **Brand-teal only (no per-item color), per Rafael (DS owner).** Single teal ramp;
   `--project-*` exist for program-area theming but components stay brand-teal. Defer
   DS decisions to Rafael; `pnpm parity` (`scripts/ds-parity.mjs`) is a read-only DS gate.
7. **DS = Tag (1 variant), not Badge. No styled Collapsible.** Accordion is the styled
   disclosure. Checkbox has two variants; most components are single-variant by design.
8. **Light mode only.** The `.dark` block is unmaintained generic shadcn — not a supported surface.

---

## 5. The Living Style Guide (`/components`)

A self-documenting gallery under `app/(frontend)/components/`. Docs data lives in
`_components/styleguide-docs.tsx` (`COMPONENT_DOCS`); each renders via
`component-doc-page.tsx` as header → live `PreviewFrame` → Installation → Usage →
optional Composition/Examples (with highlighted `CodeBlock`) → API Reference table.
Grouped into three nav sections:

- **Foundations (4):** Colors, Typography, Radii, Iconography (searchable `IconGallery`, 81 icons).
- **Primitives (16):** Button, Tag, Card, Form Fields, Checkbox, Radio, Breadcrumb,
  List Item, Infobox, Text Block, Search & Password, Photo Gallery, Calendar, Accordion, Select, Table.
- **System components (10):** Agenda, Main Menu, Home Hero, Quick Access, Services
  List, Contacts, Map Visit, Service Page, Article Page, Footer.

> **Audit caveat** (per `docs/ARCHITECTURE.md`): Navigation (breadcrumb / main-menu /
> footer / list-item) and several Sections are **not** fully audited against Figma —
> treat their pixel values as provisional relative to the audited primitives.

---

## 6. Payload admin (`/cms-admin`) styling — secondary surface

The Payload admin is themed to the DS in `app/(payload)/custom.css` (it doesn't
load `globals.css`, so values are hardcoded hex). **See that file for the full
mapping** — it's the source of truth. Secondary surface: the team works in the
custom `/admin`; `/cms-admin` is `notFound()`'d in production (`ALLOW_CMS_ADMIN=1`
escape hatch) and only runs locally, on previews, and as the `/api` host.
