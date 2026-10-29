import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-3 p-8">
      <h1 className="text-lg font-semibold">Shift Report</h1>
      <Link className="underline underline-offset-4" href="/prototype/report-editor">Report screen (prototype E, current)</Link>
      <p className="mt-6 text-sm text-muted-foreground">Archive: early structure explorations, superseded by E</p>
      <Link className="text-sm text-muted-foreground underline underline-offset-4" href="/prototype/night">Night walkthrough</Link>
      <Link className="text-sm text-muted-foreground underline underline-offset-4" href="/prototype/report">Report A–D</Link>
      <Link className="text-sm text-muted-foreground underline underline-offset-4" href="/prototype/tonight">Tonight, mobile A–C</Link>
    </main>
  );
}
