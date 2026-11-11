type Snapshot = {
  name?: string;
  description?: string;
  enabled?: boolean;
  rolloutPercent?: number;
  targets?: { userId?: string; allowed?: boolean }[];
};

function snapshot(value: unknown): Snapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Snapshot;
}

function targetMap(flag: Snapshot | null): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const target of flag?.targets ?? []) {
    if (typeof target.userId === "string") map.set(target.userId, target.allowed === true);
  }
  return map;
}

/** Short, human-readable description of one audit row. */
export function auditSummary(action: string, before: unknown, after: unknown): string | null {
  if (action === "created") return "Flag created";
  if (action === "deleted") return "Flag deleted";

  const prev = snapshot(before);
  const next = snapshot(after);
  if (!prev || !next) return null;

  if (action === "updated") {
    const parts: string[] = [];
    if (typeof prev.enabled === "boolean" && prev.enabled !== next.enabled) {
      parts.push(next.enabled ? "Turned on" : "Turned off");
    }
    if (typeof prev.rolloutPercent === "number" && prev.rolloutPercent !== next.rolloutPercent) {
      parts.push(`Rollout ${prev.rolloutPercent}% → ${next.rolloutPercent}%`);
    }
    if (prev.name !== next.name) parts.push("Name updated");
    if (prev.description !== next.description) parts.push("Description updated");
    return parts.join(" · ") || "Updated";
  }

  if (action === "targeting_changed") {
    const beforeTargets = targetMap(prev);
    const afterTargets = targetMap(next);
    const parts: string[] = [];
    for (const [userId, allowed] of afterTargets) {
      if (!beforeTargets.has(userId)) parts.push(`${userId} forced ${allowed ? "on" : "off"}`);
      else if (beforeTargets.get(userId) !== allowed) {
        parts.push(`${userId} now forced ${allowed ? "on" : "off"}`);
      }
    }
    for (const userId of beforeTargets.keys()) {
      if (!afterTargets.has(userId)) parts.push(`${userId} removed`);
    }
    return parts.join(" · ") || "Targeting updated";
  }

  return null;
}
