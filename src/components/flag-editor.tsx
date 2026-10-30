"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi } from "@/components/client-api";
import { REASON_LABELS } from "@/lib/reasons";
import type { EvalReason } from "@/lib/evaluate";
import type { FlagView } from "@/lib/flags";

export function NewFlagForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex max-w-lg flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        try {
          const data = await callApi<{ flag: FlagView }>("/api/flags", {
            method: "POST",
            body: JSON.stringify({
              key: form.get("key"),
              name: form.get("name"),
              description: form.get("description") ?? "",
            }),
          });
          router.push(`/flags/${data.flag.key}`);
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Could not create the flag");
          setPending(false);
        }
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Key</span>
        <input
          required
          name="key"
          placeholder="new-checkout"
          className="h-11 rounded-md border border-line bg-card px-3 font-mono outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input
          required
          name="name"
          className="h-11 rounded-md border border-line bg-card px-3 outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          className="rounded-md border border-line bg-card px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-accent font-medium text-accent-ink disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create flag"}
      </button>
    </form>
  );
}

export function FlagEditor({
  flag,
  audit,
}: {
  flag: FlagView;
  audit: { id: string; action: string; actorEmail: string; createdAt: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [percent, setPercent] = useState(flag.rolloutPercent);
  const [preview, setPreview] = useState<{ enabled: boolean; reason: EvalReason } | null>(null);

  async function mutate(path: string, init: RequestInit) {
    setError(null);
    try {
      await callApi(path, init);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-card p-5">
        <div>
          <p className="text-sm text-muted">Kill switch</p>
          <p className="mt-1 text-lg font-medium">{flag.enabled ? "On" : "Off"}</p>
        </div>
        <button
          type="button"
          className="h-11 rounded-md bg-foreground px-4 text-sm font-medium text-background"
          onClick={() =>
            mutate(`/api/flags/${flag.key}`, {
              method: "PATCH",
              body: JSON.stringify({ enabled: !flag.enabled }),
            })
          }
        >
          Turn {flag.enabled ? "off" : "on"}
        </button>
      </section>

      <section className="rounded-lg border border-line bg-card p-5">
        <h2 className="font-medium">Rollout percentage</h2>
        <p className="mt-1 text-sm text-muted">
          100 is everyone. 0 is nobody, unless a user is forced on. Percentage checks need a stable user id.
        </p>
        <form
          className="mt-4 flex flex-wrap items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void mutate(`/api/flags/${flag.key}`, {
              method: "PATCH",
              body: JSON.stringify({ rolloutPercent: percent }),
            });
          }}
        >
          <input
            type="range"
            min={0}
            max={100}
            value={percent}
            onChange={(event) => setPercent(Number(event.target.value))}
            className="w-48"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={(event) => setPercent(Number(event.target.value))}
            className="h-11 w-20 rounded-md border border-line px-3"
          />
          <button type="submit" className="h-11 rounded-md border border-line px-4 text-sm font-medium">
            Save percent
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-line bg-card p-5">
        <h2 className="font-medium">Per-user targeting</h2>
        <p className="mt-1 text-sm text-muted">A named user overrides the kill switch and the percentage.</p>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void mutate(`/api/flags/${flag.key}/targets`, {
              method: "POST",
              body: JSON.stringify({
                userId: form.get("userId"),
                allowed: form.get("allowed") === "true",
              }),
            });
            event.currentTarget.reset();
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span>User id</span>
            <input
              required
              name="userId"
              className="h-11 rounded-md border border-line px-3 font-mono"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span>Result</span>
            <select name="allowed" className="h-11 rounded-md border border-line bg-card px-3">
              <option value="true">Force on</option>
              <option value="false">Force off</option>
            </select>
          </label>
          <button type="submit" className="h-11 rounded-md border border-line px-4 text-sm font-medium">
            Save target
          </button>
        </form>
        <ul className="mt-4 divide-y divide-line">
          {flag.targets.length === 0 ? (
            <li className="py-3 text-sm text-muted">No targeted users.</li>
          ) : (
            flag.targets.map((target) => (
              <li key={target.userId} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-mono">{target.userId}</span>
                <span className="text-muted">{target.allowed ? "Forced on" : "Forced off"}</span>
                <button
                  type="button"
                  className="text-bad"
                  onClick={() =>
                    mutate(
                      `/api/flags/${flag.key}/targets?userId=${encodeURIComponent(target.userId)}`,
                      { method: "DELETE" },
                    )
                  }
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-lg border border-line bg-card p-5">
        <h2 className="font-medium">Who is this on for?</h2>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setError(null);
            try {
              const result = await callApi<{ enabled: boolean; reason: EvalReason }>(
                `/api/flags/${flag.key}/preview`,
                {
                  method: "POST",
                  body: JSON.stringify({ userId: form.get("userId") ?? "" }),
                },
              );
              setPreview(result);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Preview failed");
            }
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span>User id</span>
            <input name="userId" className="h-11 rounded-md border border-line px-3 font-mono" />
          </label>
          <button type="submit" className="h-11 rounded-md border border-line px-4 text-sm font-medium">
            Preview
          </button>
        </form>
        {preview ? (
          <p className="mt-4 text-sm">
            <span className={preview.enabled ? "text-good" : "text-bad"}>
              {preview.enabled ? "Enabled" : "Not enabled"}
            </span>
            <span className="text-muted"> — {REASON_LABELS[preview.reason]}</span>
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="font-medium">Recent changes</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {audit.length === 0 ? (
            <li className="py-3 text-muted">No changes yet.</li>
          ) : (
            audit.map((event) => (
              <li key={event.id} className="flex flex-wrap justify-between gap-2 py-3">
                <span>
                  {event.action} by {event.actorEmail}
                </span>
                <time className="text-muted">{new Date(event.createdAt).toLocaleString()}</time>
              </li>
            ))
          )}
        </ul>
      </section>

      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <button
        type="button"
        className="self-start text-sm text-bad"
        onClick={async () => {
          if (!window.confirm(`Delete ${flag.key}?`)) return;
          await mutate(`/api/flags/${flag.key}`, { method: "DELETE" });
          router.push("/flags");
          router.refresh();
        }}
      >
        Delete flag
      </button>
    </div>
  );
}
