import { Suspense } from "react";
import { io } from "next/cache";
import { redirect } from "next/navigation";
import { listAudit } from "@/lib/audit";
import { currentUser } from "@/lib/current-user";

export const metadata = { title: "Audit" };

export default function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ flag?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading audit…</p>}>
      <AuditList searchParams={searchParams} />
    </Suspense>
  );
}

async function AuditList({ searchParams }: { searchParams: Promise<{ flag?: string }> }) {
  await io();
  const user = await currentUser();
  if (!user) redirect("/login");
  const { flag } = await searchParams;
  const events = await listAudit(flag?.trim() || undefined);
  return (
    <div>
      <h1 className="text-2xl font-semibold">Audit</h1>
      <form className="mt-6 flex items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Flag key</span>
          <input
            name="flag"
            defaultValue={flag ?? ""}
            aria-label="Flag key"
            className="h-11 rounded-md border border-line bg-card px-3 font-mono text-sm"
          />
        </label>
        <button type="submit" className="h-11 rounded-md border border-line px-4 text-sm font-medium">
          Filter
        </button>
      </form>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {events.length === 0 ? (
          <li className="py-4 text-muted">No changes recorded.</li>
        ) : (
          events.map((event) => (
            <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
              <span>
                <span className="font-mono">{event.flagKey}</span>
                <span className="text-muted"> {event.action} by {event.actorEmail}</span>
                {event.summary ? <span className="mt-1 block text-muted">{event.summary}</span> : null}
              </span>
              <time className="text-muted">{new Date(event.createdAt).toLocaleString()}</time>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
