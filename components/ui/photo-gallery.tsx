"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type PhotoGalleryImage = { src: string; alt?: string }

type PhotoGalleryProps = {
  images: PhotoGalleryImage[]
  className?: string
  showNavigation?: boolean
}

// DS photo-gallery: full-bleed image with responsive height (227 → 260 → 424 → 410)
// and radii (16 → 16 → 24 → 32); prev/next secondary buttons bottom-left.
function PhotoGallery({
  images,
  className,
  showNavigation = true,
}: PhotoGalleryProps) {
  const [index, setIndex] = React.useState(0)
  const count = images.length
  const go = (delta: number) =>
    setIndex((i) => (i + delta + count) % Math.max(count, 1))
  const current = images[index] ?? images[0]

  return (
    <div
      data-slot="photo-gallery"
      className={cn(
        "relative w-full overflow-hidden bg-muted",
        "h-[227px] md:h-[260px] xl:h-[424px] min-[1680px]:h-[410px]",
        "rounded-[16px] xl:rounded-[24px] min-[1680px]:rounded-[32px]",
        className
      )}
    >
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.src}
          alt={current.alt ?? ""}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      {showNavigation && count > 1 ? (
        <div className="absolute bottom-0 left-0 flex items-center gap-4 p-4">
          <Button
            size="icon"
            variant="secondary"
            aria-label="Previous photo"
            onClick={() => go(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            aria-label="Next photo"
            onClick={() => go(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export { PhotoGallery }
export type { PhotoGalleryImage }
