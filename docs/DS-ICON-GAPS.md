# Design-system icon gaps (admin)

The admin (`/admin/*`) uses the Figma DS icon set (`components/icons/ds-icons.tsx`)
instead of lucide. The DS is a **public-brand** set (services, contact methods,
socials), so it lacks a number of **admin/editor utility** and **navigation**
glyphs. Those uses stay on `lucide-react` in the interim, marked with a comment
in each file.

**Hand-off:** Rafael owns the DS. To close these gaps, export the icons below
from the Figma DS iconography page (node 2278:5604) as `currentColor` inline SVGs,
add them to `ds-icons.tsx`, then swap the interim lucide/substitute for the DS
component. Search the codebase for the lucide name to find every call site.

## Missing icons

| Needed DS icon | Used for | Interim |
|---|---|---|
| **table** | Reference-table block chip (block editor) | Provisional outlined glyph in `block-editor.jsx` |
| **trash / delete** | Delete button, block delete, history "deleted" | `IconMinus` (removal glyph) |
| **list-numbered** | List block "Numbered" toggle | Text label only (no icon) |
| **spinner / loader** | `SubmitButton` pending state | CSS spinning ring |
| **copy / duplicate** | Row duplicate (`editor-ui`), copy invite link (`users-manager`) | lucide `Copy` |
| **download** | Subscribers CSV export | lucide `Download` |
| **sparkles / magic** | "Insert standard sections", Quick Access nav/dashboard | lucide `Sparkles` |
| **history / clock-rewind** | History nav + dashboard card | lucide `History` |
| **restore / rotate-ccw** | Version restore (service editor) | lucide `RotateCcw` |
| **close / X** | Sidebar mobile drawer close | lucide `X` |
| **dashboard / layout-grid** | Dashboard nav | lucide `LayoutDashboard` |
| **services / list-checks** | Services & Information nav + dashboard | lucide `ListChecks` |
| **review / clipboard-check** | Review nav | lucide `ClipboardCheck` |
| **contacts / contact-card** | Contacts nav (DS `IconUsers` collides with Team) | lucide `Contact` |
| **insights / bar-chart** | Insights nav + dashboard (DS `IconHealthChart` is medical) | lucide `BarChart3` |
| **created / file-plus** | History activity "created" | lucide `FilePlus2` |
| **edited / pencil** | History activity "edited" | lucide `Pencil` |
| **submitted / send** | History activity "submitted" | lucide `Send` |
| **declined / x-circle** | History activity "declined" | lucide `XCircle` |

## Already covered by the DS (for reference)

Text→`IconNotes`, List→`IconMenu`, Button/CTA→`IconArrowRight`, reorder→`IconArrowDown`
(+ rotate for up), add→`IconPlus`, remove→`IconMinus`, search→`IconSearch`,
link/external→`IconInternalLink`, approve→`IconCheck`, help→`IconInfo`,
conversations→`IconChatBot`, team→`IconUsers`, subscribers→`IconMail`, menu→`IconMenu`.
