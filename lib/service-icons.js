import {
  Accessibility,
  Building2,
  Bus,
  FileText,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  Package,
  Phone,
  Scale,
  Shield,
  Wallet,
} from "lucide-react";

// Maps a service's iconKey (stored in the mock CMS) to a lucide icon component.
export const serviceIconMap = {
  Phone,
  Building2,
  GraduationCap,
  Heart,
  Wallet,
  HeartPulse,
  Home,
  FileText,
  Shield,
  Bus,
  Accessibility,
  Scale,
  Package,
};

export function getServiceIcon(key) {
  return serviceIconMap[key] ?? Building2;
}
