import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-3 p-8">
      <h1 className="text-lg font-semibold">Shift Report</h1>
      <p className="text-sm text-muted-foreground">Prototypes (throwaway):</p>
      <Link className="underline underline-offset-4" href="/prototype/night">Night walkthrough — empty screen to Submission</Link>
      <Link className="underline underline-offset-4" href="/prototype/report">Report screen — confirming an Incident with a Gap</Link>
      <Link className="underline underline-offset-4" href="/prototype/tonight">Tonight — mobile capture</Link>
    </main>
  );
}
