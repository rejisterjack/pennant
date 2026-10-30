import { db } from "@/prisma/db";
import { toActor, type Actor } from "@/lib/actors";
import { HttpError, isUniqueViolation } from "@/lib/http";
import { hashPassword } from "@/lib/secrets";

export async function listTeam() {
  const users = await db.orm.public.User.orderBy((user) => user.createdAt.asc()).all();
  return users.map((user) => ({
    ...toActor(user),
    createdAt: user.createdAt,
  }));
}

export async function createTeammate(input: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "member";
}): Promise<Actor> {
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await db.orm.public.User.create({
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role,
    });
    return toActor(user);
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "That email is already in use");
    throw error;
  }
}

export async function deleteTeammate(actor: Actor, userId: string): Promise<void> {
  if (actor.id === userId) throw new HttpError(400, "You cannot remove yourself");
  const user = await db.orm.public.User.whereUnique({ id: userId }).first();
  if (!user) throw new HttpError(404, "Teammate not found");
  if (user.role === "admin") {
    const { total } = await db.orm.public.User.where({ role: "admin" }).aggregate((agg) => ({
      total: agg.count(),
    }));
    if (total <= 1) throw new HttpError(400, "The last admin cannot be removed");
  }
  await db.orm.public.User.whereUnique({ id: userId }).delete();
}
