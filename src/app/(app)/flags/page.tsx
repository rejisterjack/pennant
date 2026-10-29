import { Suspense } from "react";
import Link from "next/link";
import { io } from "next/cache";
import { listFlags } from "@/lib/flags";
import { flagSummary } from "@/lib/reasons";

export const metadata = { title: "Flags" };

export default function FlagsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading flags…</p>}>
      <FlagList />
    </Suspense>
  );
}

async function FlagList() {
  await io();
  const flags = await listFlags();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Flags</h1>
        <Link href="/flags/new" className="h-10 rounded-md bg-accent px-4 text-sm font-medium leading-10 text-accent-ink">
          New flag
        </Link>
      </div>
      {flags.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No flags yet. Create one and check it from the SDK.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {flags.map((flag) => (
            <li key={flag.key}>
              <Link href={`/flags/${flag.key}`} className="flex items-center justify-between gap-4 py-4">
                <span>
                  <span className="font-mono text-sm">{flag.key}</span>
                  <span className="mt-1 block text-sm text-muted">{flag.name}</span>
                </span>
                <span className="text-sm">
                  {flagSummary({
                    enabled: flag.enabled,
                    rolloutPercent: flag.rolloutPercent,
                    targetCount: flag.targets.length,
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
