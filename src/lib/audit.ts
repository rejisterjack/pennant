import { db } from "@/prisma/db";
import type { Actor } from "@/lib/actors";

export async function recordAudit(input: {
  actor: Actor;
  action: string;
  flagKey: string;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  await db.orm.public.AuditEvent.create({
    actorId: input.actor.id,
    actorEmail: input.actor.email,
    action: input.action,
    flagKey: input.flagKey,
    before: input.before == null ? null : JSON.parse(JSON.stringify(input.before)),
    after: input.after == null ? null : JSON.parse(JSON.stringify(input.after)),
  });
}

export async function listAudit(flagKey?: string, limit = 100) {
  const query = flagKey
    ? db.orm.public.AuditEvent.where({ flagKey })
    : db.orm.public.AuditEvent;
  const rows = await query.orderBy((event) => event.createdAt.desc()).limit(limit).all();
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    actorEmail: row.actorEmail,
    flagKey: row.flagKey,
    before: row.before,
    after: row.after,
    createdAt: row.createdAt,
  }));
}
