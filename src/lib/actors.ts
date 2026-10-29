import { db } from "@/prisma/db";
import { readBearer, readSessionToken } from "@/lib/cookies";
import { HttpError } from "@/lib/http";
import { hashToken } from "@/lib/secrets";

export type Actor = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function toActor(user: UserRow): Actor {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "admin" ? "admin" : "member",
  };
}

export async function findUserBySessionToken(token: string): Promise<Actor | null> {
  const session = await db.orm.public.Session.whereUnique({ tokenHash: hashToken(token) }).first();
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await db.orm.public.Session.whereUnique({ id: session.id }).delete();
    return null;
  }
  const user = await db.orm.public.User.whereUnique({ id: session.userId }).first();
  return user ? toActor(user) : null;
}

export async function actorFromRequest(request: Request): Promise<Actor | null> {
  const token = readSessionToken(request);
  if (!token) return null;
  return findUserBySessionToken(token);
}

export async function requireActor(request: Request): Promise<Actor> {
  const actor = await actorFromRequest(request);
  if (!actor) throw new HttpError(401, "Sign in required");
  return actor;
}

export async function requireAdmin(request: Request): Promise<Actor> {
  const actor = await requireActor(request);
  if (actor.role !== "admin") throw new HttpError(403, "Admin access required");
  return actor;
}

export async function requireApiKey(request: Request): Promise<void> {
  const secret = readBearer(request);
  if (!secret) throw new HttpError(401, "API key required");
  const key = await db.orm.public.ApiKey.whereUnique({ keyHash: hashToken(secret) }).first();
  if (!key || key.revokedAt) throw new HttpError(401, "API key required");
}
