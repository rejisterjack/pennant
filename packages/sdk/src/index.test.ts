import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Pennant } from "./index.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Pennant SDK", () => {
  it("calls evaluate with the bearer token and parses enabled", async () => {
    let seen: Request | undefined;
    const pennant = new Pennant({
      baseUrl: "https://pennant.example/",
      apiKey: "pn_test",
      fetch: async (input, init) => {
        seen = new Request(input, init);
        return jsonResponse({ enabled: true });
      },
    });

    assert.equal(await pennant.isEnabled("new-checkout", "user-1"), true);
    assert.ok(seen);
    assert.equal(seen.headers.get("authorization"), "Bearer pn_test");
    const url = new URL(seen.url);
    assert.equal(url.pathname, "/api/v1/evaluate");
    assert.equal(url.searchParams.get("flag"), "new-checkout");
    assert.equal(url.searchParams.get("userId"), "user-1");
  });

  it("throws when the request fails and no default is set", async () => {
    const pennant = new Pennant({
      baseUrl: "https://pennant.example",
      apiKey: "pn_test",
      fetch: async () => jsonResponse({ error: "no" }, 401),
    });
    await assert.rejects(() => pennant.isEnabled("new-checkout"), /401/);
  });

  it("reuses a cached value and drops the oldest entry past 1000", async () => {
    let calls = 0;
    const pennant = new Pennant({
      baseUrl: "https://pennant.example",
      apiKey: "pn_test",
      cacheTtlMs: 60_000,
      fetch: async () => {
        calls += 1;
        return jsonResponse({ enabled: true });
      },
    });
    assert.equal(await pennant.isEnabled("checkout", "user-1"), true);
    assert.equal(await pennant.isEnabled("checkout", "user-1"), true);
    assert.equal(calls, 1);

    for (let i = 0; i < 1000; i += 1) {
      await pennant.isEnabled(`flag-${i}`);
    }
    calls = 0;
    await pennant.isEnabled("checkout", "user-1");
    assert.equal(calls, 1);
  });

  it("rejects a missing flag key before calling the network", async () => {
    const pennant = new Pennant({
      baseUrl: "https://pennant.example",
      apiKey: "pn_test",
      fetch: async () => {
        throw new Error("should not fetch");
      },
    });
    await assert.rejects(() => pennant.isEnabled("  "), /flag key is required/);
  });

  it("returns defaultValue only when the request fails", async () => {
    const pennant = new Pennant({
      baseUrl: "https://pennant.example",
      apiKey: "pn_test",
      defaultValue: false,
      fetch: async () => {
        throw new Error("network");
      },
    });
    assert.equal(await pennant.isEnabled("new-checkout"), false);
  });
});
