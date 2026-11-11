import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "./http.ts";
import {
  parseDescription,
  parseEmail,
  parseExternalId,
  parseFlagKey,
  parseName,
  parsePassword,
  parseRollout,
} from "./validate.ts";

function statusOf(fn: () => unknown): number | "ok" {
  try {
    fn();
    return "ok";
  } catch (error) {
    assert.ok(error instanceof HttpError);
    return error.status;
  }
}

describe("validation bounds", () => {
  it("accepts the inclusive edges and rejects the step past them", () => {
    const cases: [string, () => unknown, number | "ok"][] = [
      ["password 7", () => parsePassword("a".repeat(7)), 400],
      ["password 8", () => parsePassword("a".repeat(8)), "ok"],
      ["password 200", () => parsePassword("a".repeat(200)), "ok"],
      ["password 201", () => parsePassword("a".repeat(201)), 400],
      ["name empty", () => parseName("  "), 400],
      ["name 1", () => parseName("A"), "ok"],
      ["name 80", () => parseName("A".repeat(80)), "ok"],
      ["name 81", () => parseName("A".repeat(81)), 400],
      ["description 500", () => parseDescription("a".repeat(500)), "ok"],
      ["description 501", () => parseDescription("a".repeat(501)), 400],
      ["rollout -1", () => parseRollout(-1), 400],
      ["rollout 0", () => parseRollout(0), "ok"],
      ["rollout 100", () => parseRollout(100), "ok"],
      ["rollout 101", () => parseRollout(101), 400],
      ["rollout fraction", () => parseRollout(10.5), 400],
      ["user id empty", () => parseExternalId("  "), 400],
      ["user id 200", () => parseExternalId("u".repeat(200)), "ok"],
      ["user id 201", () => parseExternalId("u".repeat(201)), 400],
      ["flag key shape", () => parseFlagKey("Bad_Key"), 400],
      ["flag key ok", () => parseFlagKey("new-checkout"), "ok"],
      ["email case", () => parseEmail("Ada@Example.com"), "ok"],
    ];

    for (const [name, fn, expected] of cases) {
      assert.equal(statusOf(fn), expected, name);
    }
    assert.equal(parseEmail("Ada@Example.com"), "ada@example.com");
  });
});
