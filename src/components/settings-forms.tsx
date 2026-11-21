"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi } from "@/components/client-api";

export function CreateKeyForm() {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const formElement = event.currentTarget;
          const form = new FormData(formElement);
          setError(null);
          try {
            const data = await callApi<{ key: { secret: string } }>("/api/api-keys", {
              method: "POST",
              body: JSON.stringify({ name: form.get("name") }),
            });
            setSecret(data.key.secret);
            formElement.reset();
            router.refresh();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not create the key");
          }
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Key name</span>
          <input required name="name" className="h-11 rounded-md border border-line bg-card px-3" />
        </label>
        <button type="submit" className="h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-ink">
          Create key
        </button>
      </form>
      {secret ? (
        <div className="rounded-md border border-line bg-card p-4 text-sm">
          <p>Copy this secret now. It will not be shown again.</p>
          <code className="mt-2 block break-all font-mono text-xs">{secret}</code>
          <button
            type="button"
            className="mt-3 h-9 rounded-md border border-line px-3 text-sm font-medium"
            onClick={() => navigator.clipboard.writeText(secret)}
          >
            Copy secret
          </button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-bad">{error}</p> : null}
    </div>
  );
}

export function RevokeKeyButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        className="text-sm text-bad"
        onClick={async () => {
          if (!window.confirm("Revoke this API key? Apps using it will stop evaluating flags.")) return;
          setError(null);
          try {
            await callApi(`/api/api-keys/${id}`, { method: "DELETE" });
            router.refresh();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not revoke the key");
          }
        }}
      >
        Revoke
      </button>
      {error ? <span className="text-xs text-bad">{error}</span> : null}
    </span>
  );
}

export function CreateUserForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        setError(null);
        try {
          await callApi("/api/users", {
            method: "POST",
            body: JSON.stringify({
              name: form.get("name"),
              email: form.get("email"),
              password: form.get("password"),
              role: form.get("role"),
            }),
          });
          formElement.reset();
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Could not add the teammate");
        }
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm" htmlFor="teammate-name">
        <span className="font-medium">Name</span>
        <input id="teammate-name" required name="name" className="h-11 rounded-md border border-line bg-card px-3" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm" htmlFor="teammate-email">
        <span className="font-medium">Email</span>
        <input id="teammate-email" required name="email" type="email" className="h-11 rounded-md border border-line bg-card px-3" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm" htmlFor="teammate-password">
        <span className="font-medium">Password</span>
        <input id="teammate-password" required name="password" type="password" className="h-11 rounded-md border border-line bg-card px-3" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Role</span>
        <select name="role" className="h-11 rounded-md border border-line bg-card px-3">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button type="submit" className="h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-ink sm:col-span-2">
        Add teammate
      </button>
      {error ? <p className="text-sm text-bad sm:col-span-2">{error}</p> : null}
    </form>
  );
}

export function RemoveUserButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        className="text-sm text-bad"
        onClick={async () => {
          if (!window.confirm("Remove this teammate? Their sessions stop working.")) return;
          setError(null);
          try {
            await callApi(`/api/users/${id}`, { method: "DELETE" });
            router.refresh();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not remove teammate");
          }
        }}
      >
        Remove
      </button>
      {error ? <span className="text-xs text-bad">{error}</span> : null}
    </span>
  );
}
