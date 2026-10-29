import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateFlag, rolloutBucket, type FlagRule } from "./evaluate.ts";

const flag = (patch: Partial<FlagRule> = {}): FlagRule => ({
  key: "checkout",
  enabled: true,
  rolloutPercent: 100,
  targets: [],
  ...patch,
});

function userForBucket(flagKey: string, target: number) {
  for (let i = 0; i < 20000; i += 1) {
    const id = `user-${i}`;
    if (rolloutBucket(flagKey, id) === target) return id;
  }
  throw new Error(`no user for bucket ${target}`);
}

describe("rolloutBucket", () => {
  it("is deterministic and stays in range", () => {
    const first = rolloutBucket("checkout", "user-1");
    assert.equal(rolloutBucket("checkout", "user-1"), first);
    assert.ok(first >= 0 && first <= 99);
  });
});

describe("evaluateFlag", () => {
  it("treats a missing flag as off", () => {
    assert.deepEqual(evaluateFlag(null, "user-1"), { enabled: false, reason: "missing" });
  });

  it("lets an allow target win over a kill switch", () => {
    const result = evaluateFlag(
      flag({ enabled: false, targets: [{ externalId: "ada", allowed: true }] }),
      "ada",
    );
    assert.deepEqual(result, { enabled: true, reason: "target_allow" });
  });

  it("lets a deny target win over a full rollout", () => {
    const result = evaluateFlag(
      flag({ targets: [{ externalId: "ada", allowed: false }] }),
      "ada",
    );
    assert.deepEqual(result, { enabled: false, reason: "target_deny" });
  });

  it("turns a disabled flag off for everyone else", () => {
    assert.deepEqual(evaluateFlag(flag({ enabled: false }), "ada"), {
      enabled: false,
      reason: "disabled",
    });
  });

  it("is on for everyone at 100 percent, including callers with no user id", () => {
    assert.deepEqual(evaluateFlag(flag(), undefined), { enabled: true, reason: "enabled" });
    assert.deepEqual(evaluateFlag(flag(), "ada"), { enabled: true, reason: "enabled" });
  });

  it("is off at 0 percent except for an allow target", () => {
    const outside = userForBucket("checkout", 0);
    assert.equal(evaluateFlag(flag({ rolloutPercent: 0 }), outside).reason, "rollout_out");
    assert.deepEqual(
      evaluateFlag(flag({ rolloutPercent: 0, targets: [{ externalId: outside, allowed: true }] }), outside),
      { enabled: true, reason: "target_allow" },
    );
  });

  it("requires a user id below 100 percent", () => {
    assert.deepEqual(evaluateFlag(flag({ rolloutPercent: 50 })), {
      enabled: false,
      reason: "rollout_no_user",
    });
  });

  it("includes buckets strictly below the percent and excludes the boundary", () => {
    const inside = userForBucket("checkout", 49);
    const outside = userForBucket("checkout", 50);
    assert.deepEqual(evaluateFlag(flag({ rolloutPercent: 50 }), inside), {
      enabled: true,
      reason: "rollout_in",
    });
    assert.deepEqual(evaluateFlag(flag({ rolloutPercent: 50 }), outside), {
      enabled: false,
      reason: "rollout_out",
    });
    assert.deepEqual(evaluateFlag(flag({ rolloutPercent: 100 }), userForBucket("checkout", 99)), {
      enabled: true,
      reason: "enabled",
    });
  });
});
