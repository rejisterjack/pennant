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
        <p className="rounded-md border border-line bg-card p-4 text-sm">
          Copy this secret now. It will not be shown again.
          <code className="mt-2 block break-all font-mono text-xs">{secret}</code>
        </p>
      ) : null}
      {error ? <p className="text-sm text-bad">{error}</p> : null}
    </div>
  );
}

export function RevokeKeyButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-bad"
      onClick={async () => {
        await callApi(`/api/api-keys/${id}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      Revoke
    </button>
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
      <input required name="name" placeholder="Name" className="h-11 rounded-md border border-line bg-card px-3" />
      <input
        required
        name="email"
        type="email"
        placeholder="Email"
        className="h-11 rounded-md border border-line bg-card px-3"
      />
      <input
        required
        name="password"
        type="password"
        placeholder="Password"
        className="h-11 rounded-md border border-line bg-card px-3"
      />
      <select name="role" className="h-11 rounded-md border border-line bg-card px-3">
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
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
