import { db } from "@/prisma/db";
import { recordAudit } from "@/lib/audit";
import type { Actor } from "@/lib/actors";
import { evaluateFlag, type FlagRule } from "@/lib/evaluate";
import { HttpError, isUniqueViolation } from "@/lib/http";

type TargetRow = { externalId: string; allowed: boolean };

type FlagRow = {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
  createdAt: string;
  updatedAt: string;
  targets?: TargetRow[];
};

export type FlagView = {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
  createdAt: string;
  updatedAt: string;
  targets: { userId: string; allowed: boolean }[];
};

function toView(flag: FlagRow): FlagView {
  return {
    key: flag.key,
    name: flag.name,
    description: flag.description,
    enabled: flag.enabled,
    rolloutPercent: flag.rolloutPercent,
    createdAt: flag.createdAt,
    updatedAt: flag.updatedAt,
    targets: (flag.targets ?? []).map((target) => ({
      userId: target.externalId,
      allowed: target.allowed,
    })),
  };
}

function toRule(flag: FlagView): FlagRule {
  return {
    key: flag.key,
    enabled: flag.enabled,
    rolloutPercent: flag.rolloutPercent,
    targets: flag.targets.map((target) => ({
      externalId: target.userId,
      allowed: target.allowed,
    })),
  };
}

async function loadFlag(key: string): Promise<FlagView | null> {
  const flag = await db.orm.public.Flag.whereUnique({ key }).include("targets").first();
  return flag ? toView(flag) : null;
}

export async function listFlags(): Promise<FlagView[]> {
  const flags = await db.orm.public.Flag.include("targets")
    .orderBy((flag) => flag.updatedAt.desc())
    .all();
  return flags.map(toView);
}

export async function getFlag(key: string): Promise<FlagView> {
  const flag = await loadFlag(key);
  if (!flag) throw new HttpError(404, "Flag not found");
  return flag;
}

export async function createFlag(
  actor: Actor,
  input: { key: string; name: string; description: string; enabled: boolean; rolloutPercent: number },
): Promise<FlagView> {
  try {
    await db.orm.public.Flag.create({
      key: input.key,
      name: input.name,
      description: input.description,
      enabled: input.enabled,
      rolloutPercent: input.rolloutPercent,
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "A flag with that key already exists");
    throw error;
  }
  const flag = await getFlag(input.key);
  await recordAudit({ actor, action: "created", flagKey: flag.key, after: flag });
  return flag;
}

export async function updateFlag(
  actor: Actor,
  key: string,
  patch: { name?: string; description?: string; enabled?: boolean; rolloutPercent?: number },
): Promise<FlagView> {
  const before = await getFlag(key);
  const changes: {
    name?: string;
    description?: string;
    enabled?: boolean;
    rolloutPercent?: number;
  } = {};
  if (patch.name !== undefined) changes.name = patch.name;
  if (patch.description !== undefined) changes.description = patch.description;
  if (patch.enabled !== undefined) changes.enabled = patch.enabled;
  if (patch.rolloutPercent !== undefined) changes.rolloutPercent = patch.rolloutPercent;
  if (Object.keys(changes).length === 0) throw new HttpError(400, "No changes to save");
  await db.orm.public.Flag.whereUnique({ key }).update(changes);
  const after = await getFlag(key);
  await recordAudit({ actor, action: "updated", flagKey: key, before, after });
  return after;
}

export async function deleteFlag(actor: Actor, key: string): Promise<void> {
  const before = await getFlag(key);
  await db.orm.public.Flag.whereUnique({ key }).delete();
  await recordAudit({ actor, action: "deleted", flagKey: key, before, after: null });
}

export async function setTarget(
  actor: Actor,
  key: string,
  userId: string,
  allowed: boolean,
): Promise<FlagView> {
  const before = await getFlag(key);
  const row = await db.orm.public.Flag.whereUnique({ key }).first();
  if (!row) throw new HttpError(404, "Flag not found");
  await db.orm.public.FlagTarget.upsert({
    create: { flagId: row.id, externalId: userId, allowed },
    update: { allowed },
    conflictOn: { flagId: row.id, externalId: userId },
  });
  const after = await getFlag(key);
  await recordAudit({ actor, action: "targeting_changed", flagKey: key, before, after });
  return after;
}

export async function removeTarget(actor: Actor, key: string, userId: string): Promise<FlagView> {
  const before = await getFlag(key);
  const row = await db.orm.public.Flag.whereUnique({ key }).include("targets").first();
  if (!row) throw new HttpError(404, "Flag not found");
  const target = row.targets.find((item) => item.externalId === userId);
  if (!target) throw new HttpError(404, "That user is not targeted");
  await db.orm.public.FlagTarget.whereUnique({ id: target.id }).delete();
  const after = await getFlag(key);
  await recordAudit({ actor, action: "targeting_changed", flagKey: key, before, after });
  return after;
}

export async function previewFlag(key: string, userId?: string) {
  const flag = await getFlag(key);
  return evaluateFlag(toRule(flag), userId);
}

export async function evaluateForApi(key: string, userId?: string) {
  const flag = await loadFlag(key);
  return evaluateFlag(flag ? toRule(flag) : null, userId);
}
