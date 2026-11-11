"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em]">PENNANT</p>
      <h1 className="mt-6 text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">The last action failed. Try again.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 h-11 self-start rounded-md bg-accent px-4 text-sm font-medium text-accent-ink"
      >
        Try again
      </button>
    </main>
  );
}
