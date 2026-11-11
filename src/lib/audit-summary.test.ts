import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditSummary } from "./audit-summary.ts";

const flag = {
  name: "Checkout",
  description: "",
  enabled: false,
  rolloutPercent: 100,
  targets: [] as { userId: string; allowed: boolean }[],
};

describe("auditSummary", () => {
  it("names creates and deletes", () => {
    assert.equal(auditSummary("created", null, flag), "Flag created");
    assert.equal(auditSummary("deleted", flag, null), "Flag deleted");
  });

  it("describes flag edits", () => {
    assert.equal(
      auditSummary("updated", flag, { ...flag, enabled: true, rolloutPercent: 25, name: "Checkout v2" }),
      "Turned on · Rollout 100% → 25% · Name updated",
    );
  });

  it("describes targeting changes", () => {
    assert.equal(
      auditSummary(
        "targeting_changed",
        { ...flag, targets: [{ userId: "ada", allowed: true }] },
        { ...flag, targets: [{ userId: "ada", allowed: false }, { userId: "grace", allowed: true }] },
      ),
      "ada now forced off · grace forced on",
    );
  });
});
