"use client"

import { Popover } from "@base-ui/react/popover"
import { cn } from "@/lib/utils"

/** Floating panel anchored to its trigger: pickers, menus, small forms. */
export function Pop({
  trigger,
  children,
  className,
  side = "bottom",
  align = "start",
  open,
  onOpenChange,
}: {
  trigger: React.ReactElement
  children: React.ReactNode
  className?: string
  side?: "bottom" | "top" | "left" | "right"
  align?: "start" | "center" | "end"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger render={trigger} />
      <Popover.Portal>
        <Popover.Positioner side={side} align={align} sideOffset={6} className="z-50">
          <Popover.Popup
            // Mouse opens keep focus off the first button so no ring flashes; keyboard opens move focus in.
            initialFocus={(type) => type === "keyboard"}
            className={cn("pop-motion rounded-xl bg-panel p-1.5 text-[13px] shadow-pop outline-none", className)}
          >
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
