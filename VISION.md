# Pennant — Self-Hostable Feature Flags

> Ship features behind flags, toggle them from a dashboard, and own the whole stack—without a feature-flag SaaS bill.

**Home:** [pennant.rejisterjack.com](https://pennant.rejisterjack.com) · **SDK:** `@rejisterjack/pennant` on npm

## One-line idea

A minimal self-hostable feature flag service with a TypeScript SDK and a dashboard, deployable to Vercel and Neon in minutes, so teams can ship and toggle features without paying for enterprise flag tooling.

## The problem

LaunchDarkly and similar products charge hundreds of dollars per month. Flagsmith and Unleash are open source but take real effort to host and operate. Many teams only need the basics: create a flag, read it in code with one function call, toggle it from a dashboard. Pennant is that core—free to self-host, fast to deploy.

## What Pennant does

- Flags with on/off state, percentage rollout, or per-user targeting
- TypeScript SDK with a single check: `pennant.isEnabled('my-flag', userId)`
- Dashboard to toggle flags, adjust rollout percentage, and see who a flag is enabled for
- Audit log of every flag change with timestamp and actor
- REST API so any language can query flags, not only TypeScript

## Who it's for

- Developers who want to ship behind flags without redeploying for every toggle
- Small teams who cannot justify LaunchDarkly or managed Flagsmith costs
- Anyone who wants a proper feature-flag setup without running a complex self-hosted stack

## How you use it

1. Deploy with the README’s Deploy to Vercel flow and connect a Neon database
2. Install the SDK: `npm install @rejisterjack/pennant`
3. Initialize the SDK with your Pennant URL and gate features with `pennant.isEnabled('flag-name')`
4. Create and toggle flags in the dashboard
5. The SDK fetches current flag state; behavior updates without redeploying your app

## How it runs

- Next.js full-stack app on Vercel (dashboard + API)
- Postgres on Neon (serverless)
- SDK runs in your application and calls the Pennant API at runtime
- No separate backend process beyond Next.js API routes

## Tech stack

- Next.js App Router (dashboard and API)
- Neon (Postgres)
- Prisma (ORM)
- TypeScript SDK (`@rejisterjack/pennant`)
- Tailwind CSS (dashboard UI)

## Success criteria

- One-click (or documented) deploy to a running service in under five minutes
- SDK install and single-function flag checks documented in the README
- On/off, percentage rollout, and per-user targeting working end to end
- Audit log visible in the dashboard
- Open source at [github.com/rejisterjack/pennant](https://github.com/rejisterjack/pennant)

## Limitations & non-goals

- Flag state is fetched from the server by default; add client-side caching if latency matters
- Neon’s free tier sleeps when idle—the first check after idle can be slow (document for operators)
- Percentage rollout needs a stable user identifier; the SDK docs must state that clearly
- Not a full experimentation or analytics platform—flags and rollout only

## Deployment

| Component | Platform |
|-----------|----------|
| App + API | Vercel |
| Database | Neon |
| SDK distribution | npm |
