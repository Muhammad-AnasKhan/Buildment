"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { Info } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * A small "what is this?" button that opens a short explanation. A popover rather than a hover
 * tooltip, so it works with touch and the keyboard; Escape and an outside click close it.
 */
function InfoTip({
  label,
  children,
  className,
  side = "top",
}: {
  /** Names the button for screen readers, e.g. "About XP". */
  label: string
  children: React.ReactNode
  className?: string
  side?: PopoverPrimitive.Positioner.Props["side"]
}) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        aria-label={label}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          className
        )}
      >
        <Info className="size-3.5" aria-hidden />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner side={side} sideOffset={6} collisionPadding={16} className="isolate z-50 outline-none">
          <PopoverPrimitive.Popup
            data-slot="info-tip"
            className="z-50 max-w-[min(18rem,calc(100vw-2rem))] origin-(--transform-origin) rounded-lg bg-popover p-3 text-xs leading-5 text-popover-foreground ring-1 ring-foreground/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none"
          >
            <PopoverPrimitive.Title className="sr-only">{label}</PopoverPrimitive.Title>
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { InfoTip }
