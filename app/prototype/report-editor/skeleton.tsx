// PROTOTYPE — the Report screen's shape while the report loads (ticket 22). A Neon cold start can
// take a few seconds on the first visit; this keeps the three columns in place so nothing jumps
// when the report arrives. Static on purpose: no shimmer, it fades in only if the wait is noticeable.

import { cn } from "@/lib/utils"

const Bar = ({ className }: { className?: string }) => <div className={cn("rounded-md bg-raise", className)} />

export function ReportSkeleton() {
  return (
    <div
      aria-busy
      className="rx skeleton flex h-dvh min-h-[640px] min-w-[1180px] flex-col bg-canvas text-[14px]"
    >
      <p role="status" className="sr-only">
        Loading the report
      </p>
      <div aria-hidden className="contents">
        <div className="flex h-16 shrink-0 items-center gap-3.5 px-5">
          <div className="size-8 rounded-lg bg-panel shadow-panel" />
          <Bar className="h-3.5 w-52" />
          <div className="h-6 w-28 rounded-full bg-panel shadow-panel" />
          <div className="ml-auto flex items-center gap-2">
            <Bar className="h-8 w-28 rounded-lg" />
            <Bar className="h-8 w-20 rounded-lg" />
            <div className="ml-2.5 size-[30px] rounded-full bg-raise" />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[336px_minmax(0,1fr)_280px] gap-3 px-3 pb-3">
          <div className="flex min-h-0 flex-col rounded-2xl bg-panel shadow-panel">
            <div className="flex h-14 shrink-0 items-center pl-5">
              <Bar className="h-3.5 w-12" />
            </div>
            <div className="flex flex-col gap-2.5 px-3 pt-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--line)]">
                  <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-raise" />
                    <Bar className="h-3 w-24" />
                    <Bar className="ml-auto h-3 w-10" />
                  </div>
                  <Bar className="mt-3.5 h-3 w-full" />
                  <Bar className="mt-2 h-3 w-3/5" />
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-0 rounded-2xl bg-panel shadow-panel">
            <div className="mx-auto max-w-[720px] px-14 pt-16">
              <Bar className="h-3 w-40" />
              <Bar className="mt-4 h-8 w-72 rounded-lg" />
              <Bar className="mt-4 h-3 w-80" />
              {[0, 1].map((i) => (
                <div key={i} className="mt-14">
                  <Bar className="h-5 w-36" />
                  <Bar className="mt-5 h-3 w-full" />
                  <Bar className="mt-3 h-3 w-full" />
                  <Bar className="mt-3 h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-2xl bg-panel px-2 pt-3 shadow-panel">
            <Bar className="mx-2.5 mt-3 h-3.5 w-20" />
            <div className="mt-4 flex flex-col">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex h-9 items-center gap-2.5 px-2.5">
                  <div className="size-2 rounded-full bg-raise" />
                  <Bar className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
