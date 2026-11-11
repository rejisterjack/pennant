import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em]">PENNANT</p>
      <h1 className="mt-6 text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">That flag or page is not here.</p>
      <Link href="/flags" className="mt-6 text-sm font-medium">
        Back to flags
      </Link>
    </main>
  );
}
