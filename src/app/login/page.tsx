import { Suspense } from "react";
import Link from "next/link";
import { io } from "next/cache";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { userCount } from "@/lib/auth";
import { currentUser } from "@/lib/current-user";

export const instant = false;
export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading…</p>}>
      <LoginGate />
    </Suspense>
  );
}

async function LoginGate() {
  await io();
  const user = await currentUser();
  if (user) redirect("/flags");
  if ((await userCount()) === 0) redirect("/setup");
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em]">PENNANT</p>
      <h1 className="mt-6 text-3xl font-semibold">Sign in</h1>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        Need the first account? <Link href="/setup">Set up Pennant</Link>
      </p>
    </main>
  );
}
