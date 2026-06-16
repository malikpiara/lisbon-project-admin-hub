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

export function getServiceIconKey(slug, fallback) {
  return serviceIconOverrides[slug] ?? fallback;
}

export function getServiceIcon(key) {
  return serviceIconMap[key] ?? IconBuilding;
}
