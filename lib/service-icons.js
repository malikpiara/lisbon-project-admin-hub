import { createElement } from "react";

import { Icon } from "@/components/ui/icon";
import { DS_ICONS } from "@/lib/ds-icons-data";
import {
  IconAccessible,
  IconBuilding,
  IconBus,
  IconGender,
  IconGlobe,
  IconHandHeart,
  IconHealthChart,
  IconHeartCross,
  IconHeartOpen,
  IconHome,
  IconLegal,
  IconNotes,
  IconPhone,
  IconSchool,
  IconShield,
  IconTip,
  IconUsers,
} from "@/components/icons/ds-icons";

// Maps a service's iconKey (stored in the mock CMS) to a Lisbon Project DS icon
// component. The keys are kept for backwards-compatibility with the seed data
// and the admin icon picker; each now renders the real DS glyph exported from
// Figma (see lib/service-icons mapping → iconography page). Canonical category
// glyphs follow the DS iconography labels (Legal → legal, Housing → home, …).
export const serviceIconMap = {
  Phone: IconPhone,
  PhoneCall: IconPhone,
  Building2: IconBuilding,
  GraduationCap: IconSchool,
  BookOpenText: IconSchool,
  Heart: IconHeartOpen,
  Wallet: IconTip,
  HeartPulse: IconHealthChart,
  Home: IconHome,
  FileText: IconNotes,
  IdCard: IconGlobe,
  Shield: IconShield,
  HandHeart: IconHandHeart,
  Bus: IconBus,
  Accessibility: IconAccessible,
  Scale: IconLegal,
  Package: IconHeartCross,
  Rainbow: IconGender,
  UsersRound: IconUsers,
};

export const serviceIconOverrides = {
  "emergency-contacts": "PhoneCall",
  "family-child-support": "UsersRound",
  "legal-assistance": "Scale",
  "legal-assistance-2": "Scale",
  "community-integration": "HandHeart",
  immigration: "IdCard",
  "gender-sexuality": "Rainbow",
};

// Legacy key → the canonical DS name of the very same glyph. Used by the icon
// picker so a service that still stores "UsersRound" highlights the "users"
// tile (and re-picking writes the DS name forward).
export const legacyIconToDsName = {
  Phone: "call-solo",
  PhoneCall: "call-solo",
  Building2: "building",
  GraduationCap: "school",
  BookOpenText: "school",
  Heart: "heart-open",
  Wallet: "tip",
  HeartPulse: "health-chart",
  Home: "home",
  FileText: "notes",
  IdCard: "globe",
  Shield: "shield",
  HandHeart: "hand-heart",
  Bus: "bus",
  Accessibility: "accessible",
  Scale: "legal",
  Package: "heart-cross",
  Rainbow: "gender",
  UsersRound: "users",
};

export function getServiceIconKey(slug, fallback) {
  return serviceIconOverrides[slug] ?? fallback;
}

// New picks store canonical DS iconography names ("hand-heart", "school", …)
// rendered through the ui Icon component — the same set as /components/icons.
// One wrapper component per name, cached so React sees a stable identity.
// strokeWidth is swallowed: DS glyphs are filled shapes, and the wrapper is a
// span (an unknown strokeWidth attribute would trigger a React DOM warning).
const dsIconCache = new Map();
function dsServiceIcon(name) {
  if (!dsIconCache.has(name)) {
    const Glyph = ({ strokeWidth: _strokeWidth, ...props }) =>
      createElement(Icon, { name, ...props });
    Glyph.displayName = `DsServiceIcon(${name})`;
    dsIconCache.set(name, Glyph);
  }
  return dsIconCache.get(name);
}

export function getServiceIcon(key) {
  if (serviceIconMap[key]) return serviceIconMap[key]; // legacy stored keys
  if (DS_ICONS[key]) return dsServiceIcon(key);
  return IconBuilding;
}
