import { Suspense } from "react";
import { io } from "next/cache";
import { notFound } from "next/navigation";
import { FlagEditor } from "@/components/flag-editor";
import { listAudit } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import { getFlag } from "@/lib/flags";

export const metadata = { title: "Flag" };

export default function FlagPage({ params }: { params: Promise<{ key: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading flag…</p>}>
      <FlagDetail params={params} />
    </Suspense>
  );
}

async function FlagDetail({ params }: { params: Promise<{ key: string }> }) {
  await io();
  const { key } = await params;
  const loaded = await loadFlagPage(key);
  return (
    <div>
      <p className="font-mono text-sm text-muted">{loaded.flag.key}</p>
      <h1 className="mt-1 text-2xl font-semibold">{loaded.flag.name}</h1>
      {loaded.flag.description ? (
        <p className="mt-2 max-w-xl text-sm text-muted">{loaded.flag.description}</p>
      ) : null}
      <div className="mt-8">
        <FlagEditor flag={loaded.flag} audit={loaded.events} />
      </div>
    </div>
  );
}

async function loadFlagPage(key: string) {
  try {
    const flag = await getFlag(key);
    const events = await listAudit(key, 8);
    return { flag, events };
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
}
