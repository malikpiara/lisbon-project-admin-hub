// Service "tone" is stored as a Tailwind palette name. Map each to a concrete
// swatch colour so the admin can show colour instead of an opaque word.
export const TONE_HEX = {
  rose: "#f43f5e",
  teal: "#14b8a6",
  violet: "#8b5cf6",
  pink: "#ec4899",
  emerald: "#10b981",
  cyan: "#06b6d4",
  orange: "#f97316",
  blue: "#3b82f6",
};

export function toneHex(tone) {
  return TONE_HEX[tone] ?? "#94a3b8"; // slate-400 fallback for unknown tones
}

export function toneLabel(tone) {
  if (!tone) return "Default";
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}
