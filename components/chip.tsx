import { cva, type VariantProps } from "class-variance-authority"

/**
 * Compact property value (time, place, type) that opens a picker. Apply to a <button>.
 * tone: set = has a value, unknown = marked Unknown, gap = required and missing, add = optional and empty.
 */
export const chip = cva(
  "press inline-flex h-7 max-w-full items-center gap-1.5 truncate rounded-md px-2 text-[13px] whitespace-nowrap",
  {
    variants: {
      tone: {
        set: "bg-raise text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:bg-press tabular-nums",
        unknown: "bg-raise text-ink-2 shadow-[inset_0_0_0_1px_var(--line)] hover:bg-press tabular-nums",
        gap: "bg-gap-soft font-medium text-gap shadow-[inset_0_0_0_1px_var(--gap-ring)] hover:shadow-[inset_0_0_0_1px_var(--gap-line)]",
        add: "text-ink-3 shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-raise hover:text-ink",
      },
    },
  },
)

export type ChipTone = NonNullable<VariantProps<typeof chip>["tone"]>
