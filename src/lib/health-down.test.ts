import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";

describe("health when the database is down", () => {
  it("returns 503 without a stack or query text", async () => {
    const refused = "postgresql://pennant:pennant@127.0.0.1:1/pennant";
    const child = spawn(path.join("node_modules", ".bin", "tsx"), ["scripts/health-down-check.ts"], {
      env: {
        ...process.env,
        DATABASE_URL: refused,
        DIRECT_URL: refused,
        AUTH_SECRET: "ci-auth-secret-not-for-production",
      },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    const code = await new Promise<number | null>((resolve, reject) => {
      child.on("error", reject);
      child.on("close", resolve);
    });
    assert.equal(code, 0, stderr);
    const result = JSON.parse(stdout) as { status: number; body: string };
    assert.equal(result.status, 503);
    assert.equal(result.body, JSON.stringify({ ok: false }));
    assert.equal(result.body.includes("stack"), false);
    assert.equal(stderr.includes("pennant:pennant"), false);
  });
});
