import { Suspense } from "react";
import { io } from "next/cache";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/auth-forms";
import { userCount } from "@/lib/auth";
import { currentUser } from "@/lib/current-user";

export const instant = false;
export const metadata = { title: "Setup" };

export default function SetupPage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading…</p>}>
      <SetupGate />
    </Suspense>
  );
}

async function SetupGate() {
  await io();
  const user = await currentUser();
  if (user) redirect("/flags");
  if ((await userCount()) > 0) redirect("/login");
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em]">PENNANT</p>
      <h1 className="mt-6 text-3xl font-semibold">Create the first admin</h1>
      <p className="mt-2 text-sm text-muted">This screen closes after the first account exists.</p>
      <div className="mt-8">
        <SetupForm />
      </div>
    </main>
  );
}
