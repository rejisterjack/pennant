import { db } from "@/prisma/db";
import type { Actor } from "@/lib/actors";
import { generateApiKey } from "@/lib/secrets";

export async function listApiKeys() {
  const keys = await db.orm.public.ApiKey.orderBy((key) => key.createdAt.desc()).all();
  return keys.map((key) => ({
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    createdAt: key.createdAt,
    revokedAt: key.revokedAt,
  }));
}

export async function createApiKey(actor: Actor, name: string) {
  const generated = generateApiKey();
  const key = await db.orm.public.ApiKey.create({
    name,
    prefix: generated.prefix,
    keyHash: generated.keyHash,
    userId: actor.id,
  });
  return {
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    secret: generated.secret,
    createdAt: key.createdAt,
  };
}

export async function revokeApiKey(id: string): Promise<void> {
  const key = await db.orm.public.ApiKey.whereUnique({ id }).first();
  if (!key) return;
  if (key.revokedAt) return;
  await db.orm.public.ApiKey.whereUnique({ id }).update({
    revokedAt: new Date().toISOString(),
  });
}
