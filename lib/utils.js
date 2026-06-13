import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The DS adds custom text sizes (text-ds-xxxxl … text-ds-xxs) via the Tailwind
// theme. tailwind-merge doesn't know these are font-sizes, so without registering
// them it conflates e.g. `text-ds-xs` (a size) with `text-primary-foreground`
// (a color) and silently drops one — which is how `sm` buttons lost their white
// label. Declaring them in the font-size group lets size + color coexist.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "ds-xxxxl",
            "ds-xxxl",
            "ds-xxl",
            "ds-xl",
            "ds-l",
            "ds-m",
            "ds-s",
            "ds-xs",
            "ds-xxs",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
