"use client"

import { Tooltip } from "@base-ui/react/tooltip"

/** Short label on hover/focus. Needs a TooltipProvider above it (app/layout.tsx). */
export function Tip({ label, children }: { label: React.ReactNode; children: React.ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} className="z-50">
          <Tooltip.Popup className="pop-motion rounded-md bg-cta px-2 py-1 text-xs text-cta-ink">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
