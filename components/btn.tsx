"use client"

import { Button, type ButtonProps } from "@base-ui/react/button"
import { cn } from "@/lib/utils"
import { Tip } from "./tip"

type BtnProps = Omit<ButtonProps, "className"> & {
  className?: string
  variant?: "primary" | "secondary" | "ghost" | "ai"
  size?: "sm" | "md"
}

export function Btn({ variant = "secondary", size = "md", className, ...props }: BtnProps) {
  return (
    <Button
      type="button"
      className={cn(
        "press inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
        size === "md" ? "h-8 px-3 text-[13px]" : "h-7 px-2.5 text-xs",
        variant === "primary" && "bg-cta text-cta-ink hover:opacity-90",
        variant === "secondary" && "bg-raise text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:bg-press",
        variant === "ghost" && "text-ink-2 hover:bg-raise hover:text-ink",
        variant === "ai" && "text-ai hover:bg-ai-soft [&_svg]:text-ai",
        className,
      )}
      {...props}
    />
  )
}

/** Icon-only button: always labelled, always with a Tip. 28px box, 36px hit area. */
export function IconBtn({ label, className, children, ...props }: Omit<BtnProps, "variant" | "size"> & { label: string }) {
  return (
    <Tip label={label}>
      <Button
        type="button"
        aria-label={label}
        className={cn(
          "press relative grid size-7 shrink-0 place-items-center rounded-md text-ink-3 hover:bg-raise hover:text-ink disabled:opacity-40 [&_svg]:size-4",
          "after:absolute after:-inset-1 after:content-['']",
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    </Tip>
  )
}
