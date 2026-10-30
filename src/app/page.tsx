import Link from "next/link";

const snippet = `import { Pennant } from "@rejisterjack/pennant";

const pennant = new Pennant({
  baseUrl: process.env.PENNANT_URL!,
  apiKey: process.env.PENNANT_API_KEY!,
});

await pennant.isEnabled("new-checkout", userId);`;

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16">
      <header className="flex items-center justify-between">
        <p className="text-sm font-semibold tracking-[0.18em]">PENNANT</p>
        <Link href="/login" className="text-sm font-medium">
          Sign in
        </Link>
      </header>
      <main className="mt-20 flex flex-col gap-8">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
          Ship behind a flag. Toggle it without a redeploy.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted">
          A self-hosted feature flag service with a TypeScript SDK and a dashboard. On, off, a
          percentage, or a named user — and you own the database.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-ink"
            href="https://vercel.com/new/clone?repository-url=https://github.com/rejisterjack/pennant&env=AUTH_SECRET&project-name=pennant&repository-name=pennant"
          >
            Deploy to Vercel
          </a>
          <Link
            href="/setup"
            className="inline-flex h-11 items-center rounded-md border border-line px-4 text-sm font-medium"
          >
            Open the dashboard
          </Link>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-line bg-card p-5 text-sm leading-7">
          <code>{snippet}</code>
        </pre>
      </main>
    </div>
  );
}
