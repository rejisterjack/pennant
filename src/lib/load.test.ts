import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { POST as setup } from "../app/api/auth/setup/route.ts";
import { POST as createFlag } from "../app/api/flags/route.ts";
import { POST as createKey } from "../app/api/api-keys/route.ts";
import { GET as evaluate } from "../app/api/v1/evaluate/route.ts";
import { db } from "../prisma/db.ts";

function jsonRequest(path: string, body: unknown, cookie?: string) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("evaluate latency", () => {
  after(async () => {
    await db.close();
  });

  it("serves 200 concurrent checks with no server errors", async () => {
    const plan = db.raw
      .sql`TRUNCATE TABLE "AuditEvent", "FlagTarget", "Flag", "ApiKey", "Session", "User" CASCADE`
      .affectedCount()
      .build();
    await db.execute(plan);

    const setupResponse = await setup(
      jsonRequest("/api/auth/setup", { email: "ada@example.com", password: "correct-horse", name: "Ada" }),
    );
    const cookie = (setupResponse.headers.get("set-cookie") ?? "").split(";")[0]!;
    await createFlag(jsonRequest("/api/flags", { key: "checkout", name: "Checkout", enabled: true }, cookie));
    const keyResponse = await createKey(jsonRequest("/api/api-keys", { name: "load" }, cookie));
    const secret = ((await keyResponse.json()) as { key: { secret: string } }).key.secret;

    await evaluate(
      new Request("http://localhost/api/v1/evaluate?flag=checkout&userId=warm", {
        headers: { authorization: `Bearer ${secret}` },
      }),
    );

    const samples = await Promise.all(
      Array.from({ length: 200 }, async () => {
        const started = performance.now();
        const response = await evaluate(
          new Request("http://localhost/api/v1/evaluate?flag=checkout&userId=warm", {
            headers: { authorization: `Bearer ${secret}` },
          }),
        );
        return { status: response.status, ms: performance.now() - started };
      }),
    );

    assert.ok(samples.every((sample) => sample.status < 500));
    const ordered = samples.map((sample) => sample.ms).sort((a, b) => a - b);
    const p95 = ordered[Math.ceil(ordered.length * 0.95) - 1]!;
    // Queueing on the shared CI pool is included. This catches a stall, not a local-only budget.
    assert.ok(p95 < 1000, `p95 was ${p95.toFixed(1)}ms`);
  });
});
