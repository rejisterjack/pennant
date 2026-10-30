"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { callApi } from "@/components/client-api";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="h-11 rounded-md border border-line bg-card px-3 outline-none focus:border-accent"
      />
    </label>
  );
}

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        try {
          await callApi("/api/auth/setup", {
            method: "POST",
            body: JSON.stringify({
              name: form.get("name"),
              email: form.get("email"),
              password: form.get("password"),
            }),
          });
          router.push("/flags");
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Setup failed");
          setPending(false);
        }
      }}
    >
      <Field label="Name" name="name" autoComplete="name" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" />
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-accent font-medium text-accent-ink disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create admin account"}
      </button>
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        try {
          await callApi("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: form.get("email"),
              password: form.get("password"),
            }),
          });
          router.push("/flags");
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Sign in failed");
          setPending(false);
        }
      }}
    >
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-accent font-medium text-accent-ink disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-muted hover:text-foreground"
      onClick={async () => {
        await callApi("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
