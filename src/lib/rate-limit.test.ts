import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginBlocked, recordLoginFailure, requestIp } from "./rate-limit.ts";

describe("login rate limit", () => {
  it("blocks after the configured number of failures", () => {
    const key = `test-${Date.now()}`;
    assert.equal(loginBlocked(key, 2, 60_000), false);
    recordLoginFailure(key, 60_000);
    assert.equal(loginBlocked(key, 2, 60_000), false);
    recordLoginFailure(key, 60_000);
    assert.equal(loginBlocked(key, 2, 60_000), true);
  });

  it("reads the first forwarded address", () => {
    const request = new Request("http://localhost/api/auth/login", {
      headers: { "x-forwarded-for": "203.0.113.4, 10.0.0.1" },
    });
    assert.equal(requestIp(request), "203.0.113.4");
  });
});
