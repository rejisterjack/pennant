import { createHash } from "node:crypto";

export type TargetRule = {
  externalId: string;
  allowed: boolean;
};

export type FlagRule = {
  key: string;
  enabled: boolean;
  rolloutPercent: number;
  targets: TargetRule[];
};

export type EvalReason =
  | "missing"
  | "target_allow"
  | "target_deny"
  | "disabled"
  | "rollout_no_user"
  | "rollout_in"
  | "rollout_out"
  | "enabled";

export type Evaluation = {
  enabled: boolean;
  reason: EvalReason;
};

/** Stable 0–99 bucket for a flag and user. The same pair always lands in the same bucket. */
export function rolloutBucket(flagKey: string, userId: string): number {
  const hex = createHash("sha256").update(`${flagKey}:${userId}`).digest("hex");
  return parseInt(hex.slice(0, 8), 16) % 100;
}

/**
 * 1. Unknown flag is off.
 * 2. An explicit target wins (allow or deny).
 * 3. A disabled flag is off for everyone else.
 * 4. 100% is on for everyone else.
 * 5. A lower percent needs a user id and includes buckets strictly below that percent.
 */
export function evaluateFlag(flag: FlagRule | null, userId?: string | null): Evaluation {
  if (!flag) return { enabled: false, reason: "missing" };

  const id = userId?.trim() || undefined;
  if (id) {
    const target = flag.targets.find((rule) => rule.externalId === id);
    if (target) {
      return target.allowed
        ? { enabled: true, reason: "target_allow" }
        : { enabled: false, reason: "target_deny" };
    }
  }

  if (!flag.enabled) return { enabled: false, reason: "disabled" };

  const percent = Math.min(100, Math.max(0, flag.rolloutPercent));
  if (percent >= 100) return { enabled: true, reason: "enabled" };
  if (!id) return { enabled: false, reason: "rollout_no_user" };

  const bucket = rolloutBucket(flag.key, id);
  return bucket < percent
    ? { enabled: true, reason: "rollout_in" }
    : { enabled: false, reason: "rollout_out" };
}
