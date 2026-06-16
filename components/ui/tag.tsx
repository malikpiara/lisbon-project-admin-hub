import type * as React from "react";

import { cn } from "@/lib/utils";

// DS Tag — the single category/metadata tag from the Figma DS: a pill with a
// soft brand-200 border and brand-800 text. One variant by design.
function Tag({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="tag"
      className={cn(
        "inline-flex min-h-8 w-fit shrink-0 items-center justify-center gap-1 rounded-full border-2 border-secondary px-3 text-ds-xxs font-bold whitespace-nowrap text-brand-800 [&>svg]:pointer-events-none [&>svg]:size-3",
        className
      )}
      {...props}
    />
  );
}

export { Tag };
