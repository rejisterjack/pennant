import { db } from "@/prisma/db";
import { type Actor, toActor } from "@/lib/actors";
import { HttpError, isUniqueViolation } from "@/lib/http";
import { hashPassword, hashToken, randomToken, verifyPassword } from "@/lib/secrets";
import { SESSION_MAX_AGE } from "@/lib/cookies";

export async function userCount(): Promise<number> {
  const { total } = await db.orm.public.User.aggregate((agg) => ({ total: agg.count() }));
  return total;
}

export async function createSession(userId: string): Promise<string> {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  await db.orm.public.Session.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
  });
  return token;
}

export async function setupAccount(input: {
  email: string;
  password: string;
  name: string;
}): Promise<{ actor: Actor; token: string }> {
  const passwordHash = await hashPassword(input.password);
  try {
    return await db.transaction(async (tx) => {
      const { total } = await tx.orm.public.User.aggregate((agg) => ({ total: agg.count() }));
      if (total > 0) throw new HttpError(409, "Setup is already complete");
      const user = await tx.orm.public.User.create({
        email: input.email,
        passwordHash,
        name: input.name,
        role: "admin",
      });
      const token = randomToken();
      await tx.orm.public.Session.create({
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
      });
      return { actor: toActor(user), token };
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isUniqueViolation(error)) throw new HttpError(409, "Setup is already complete");
    throw error;
  }
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<{ actor: Actor; token: string }> {
  const user = await db.orm.public.User.whereUnique({ email: input.email }).first();
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }
  const token = await createSession(user.id);
  return { actor: toActor(user), token };
}

export async function logout(token: string | null): Promise<void> {
  if (!token) return;
  const session = await db.orm.public.Session.whereUnique({ tokenHash: hashToken(token) }).first();
  if (session) await db.orm.public.Session.whereUnique({ id: session.id }).delete();
}
