import {
  Accessibility,
  BookOpenText,
  Building2,
  Bus,
  FileText,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Home,
  IdCard,
  Package,
  Phone,
  PhoneCall,
  Rainbow,
  Scale,
  Shield,
  UsersRound,
  Wallet,
} from "lucide-react";

// Maps a service's iconKey (stored in the mock CMS) to a lucide icon component.
export const serviceIconMap = {
  Phone,
  PhoneCall,
  Building2,
  GraduationCap,
  BookOpenText,
  Heart,
  Wallet,
  HeartPulse,
  Home,
  FileText,
  IdCard,
  Shield,
  HandHeart,
  Bus,
  Accessibility,
  Scale,
  Package,
  Rainbow,
  UsersRound,
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
  return serviceIconMap[key] ?? Building2;
}
