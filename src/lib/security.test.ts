import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import robots from "../app/robots.ts";
import nextConfig from "../../next.config.ts";
import { handle } from "./http.ts";

describe("security headers", () => {
  it("sends the production response headers and hides the site from crawlers", async () => {
    assert.ok(nextConfig.headers);
    const rules = await nextConfig.headers();
    const headers = Object.fromEntries(rules[0]!.headers.map((header) => [header.key, header.value]));
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["X-Frame-Options"], "DENY");
    assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
    assert.equal(headers["Permissions-Policy"], "camera=(), microphone=(), geolocation=()");
    assert.deepEqual(robots().rules, { userAgent: "*", disallow: "/" });
  });

  it("reads the session before rendering private flag and audit data", () => {
    const pages = [
      ["../app/(app)/flags/page.tsx", "await listFlags()"],
      ["../app/(app)/audit/page.tsx", "await listAudit("],
      ["../app/(app)/flags/[key]/page.tsx", "await getFlag("],
    ] as const;
    for (const [file, query] of pages) {
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      const session = source.indexOf("await currentUser()");
      const load = source.indexOf(query);
      assert.ok(session > 0 && load > session, file);
    }
  });

  it("does not put internal errors in the response body", async () => {
    const write = console.error;
    console.error = () => {};
    try {
      const response = await handle(async () => {
        throw new Error('relation "User" password sql SELECT secret');
      });
      assert.equal(response.status, 500);
      assert.equal(await response.text(), JSON.stringify({ error: "Internal error" }));
    } finally {
      console.error = write;
    }
  });
});
