import { Suspense } from "react";
import { io } from "next/cache";
import { redirect } from "next/navigation";
import { CreateKeyForm, RevokeKeyButton } from "@/components/settings-forms";
import { listApiKeys } from "@/lib/api-keys";
import { currentUser } from "@/lib/current-user";

export const metadata = { title: "API keys" };

export default function KeysPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading keys…</p>}>
      <Keys />
    </Suspense>
  );
}

async function Keys() {
  await io();
  const user = await currentUser();
  if (!user) redirect("/login");
  const keys = user.role === "admin" ? await listApiKeys() : [];
  return (
    <div>
      <h1 className="text-2xl font-semibold">API keys</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        The SDK sends a key as a bearer token. Keys are stored as hashes and shown once.
      </p>
      {user.role !== "admin" ? (
        <p className="mt-8 text-sm">Only admins can manage API keys.</p>
      ) : (
        <>
          <div className="mt-8">
            <CreateKeyForm />
          </div>
          <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
            {keys.length === 0 ? (
              <li className="py-4 text-muted">No keys yet.</li>
            ) : (
              keys.map((key) => (
                <li key={key.id} className="flex items-center justify-between gap-4 py-4">
                  <span>
                    <span className="font-medium">{key.name}</span>
                    <span className="ml-3 font-mono text-muted">{key.prefix}…</span>
                    {key.revokedAt ? <span className="ml-3 text-bad">Revoked</span> : null}
                  </span>
                  {key.revokedAt ? null : <RevokeKeyButton id={key.id} />}
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}
