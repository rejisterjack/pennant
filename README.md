# Pennant

Self-hosted feature flags. Create a flag, check it with one SDK call, and toggle it from a dashboard without redeploying your app.

```ts
import { Pennant } from "@rejisterjack/pennant";

const pennant = new Pennant({
  baseUrl: process.env.PENNANT_URL!,
  apiKey: process.env.PENNANT_API_KEY!,
});

await pennant.isEnabled("new-checkout", userId);
```

## Deploy

You need a [Vercel](https://vercel.com) project and a [Neon](https://neon.tech) Postgres database. One Pennant deployment is one environment: run a second deploy for staging.

1. Create a Neon project and copy both connection strings.
2. Set `DATABASE_URL` to the **pooled** string (the host contains `-pooler`). The app uses this at runtime.
3. Set `DIRECT_URL` to the **direct** string (no `-pooler`). Migrations use this so they are not sent through the pooler.
4. Set `AUTH_SECRET` to a long random string (`openssl rand -base64 32`). Rotating it signs everyone out and invalidates API keys.
5. Deploy. The build runs `prisma db migrate` before `next build`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rejisterjack/pennant&env=DATABASE_URL,DIRECT_URL,AUTH_SECRET&project-name=pennant&repository-name=pennant)

After the deploy, open the site, create the admin account, then create an API key under **API keys**. The full secret is shown once.

### Post-deploy checklist

1. `GET /api/health` returns `{ "ok": true }`.
2. Open `/setup` and create the first admin (this screen closes after the first account).
3. Under **API keys**, create a key and copy the secret once.
4. Check a flag with the SDK or `GET /api/v1/evaluate?flag=<key>` and `Authorization: Bearer <key>`.

Neon’s free compute sleeps when idle. The first flag check after idle can be slow. `/api/health` confirms the app can reach the database.

## Local development

```bash
cp .env.example .env
# Point DATABASE_URL and DIRECT_URL at Postgres 15 or newer.
npm install
npx prisma db migrate
npm run dev
```

Open http://localhost:3000/setup and create the first admin. Further accounts are added from **Team**. Pennant does not send email.

## SDK

The package is server-side only. Do not put `PENNANT_API_KEY` in browser code.

```bash
npm install @rejisterjack/pennant
```

`isEnabled(flag, userId?)` calls `GET /api/v1/evaluate`. `cacheTtlMs` defaults to `0`, so every check reads the current flag. Pass `defaultValue` only if a failed request should return that boolean instead of throwing. A missing flag is a successful response of `{ enabled: false }`, not a failure.

Any language can call the same endpoint with `Authorization: Bearer <api key>`.

`GET /api/v1/flags` returns flag definitions for a caller that wants to cache them. The SDK does not evaluate locally.

## How a flag decides

Checks are uncached at the CDN (`Cache-Control: private, no-store`).

1. An unknown flag is off. A missing or revoked API key is rejected and the SDK throws, unless you passed `defaultValue`.
2. A per-user target wins. Force on stays on even when the flag is off. Force off stays off even at 100%.
3. If the flag is off, everyone else is off.
4. At 100%, everyone else is on, including checks with no user id.
5. Below 100%, Pennant hashes `flagKey:userId` with SHA-256 and takes a bucket from 0 to 99. The user is on when `bucket < rolloutPercent`. The same user stays in the same bucket. A check with no user id is off.

Percentage rollout needs a stable user id. `0` means only forced-on users. `100` means everyone who is not forced off.

## What this is not

Pennant stores flags and rollout rules. It does not run experiments, collect analytics, or provide segments, webhooks, or in-app environments.
