import type { EvalReason } from "@/lib/evaluate";

export const REASON_LABELS: Record<EvalReason, string> = {
  missing: "This flag does not exist.",
  target_allow: "This user is forced on.",
  target_deny: "This user is forced off.",
  disabled: "The flag is off.",
  rollout_no_user: "Percentage rollout needs a stable user id.",
  rollout_in: "This user is inside the rollout percentage.",
  rollout_out: "This user is outside the rollout percentage.",
  enabled: "The flag is on for everyone who is not forced off.",
};

export function flagSummary(flag: {
  enabled: boolean;
  rolloutPercent: number;
  targetCount: number;
}): string {
  if (!flag.enabled && flag.targetCount === 0) return "Off";
  if (flag.enabled && flag.rolloutPercent >= 100) {
    return flag.targetCount > 0 ? "On, with exceptions" : "On";
  }
  if (!flag.enabled) return "Off, with exceptions";
  return `${flag.rolloutPercent}% rollout`;
}
