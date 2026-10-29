import { cookies } from "next/headers";
import { findUserBySessionToken } from "@/lib/actors";
import { SESSION_COOKIE } from "@/lib/cookies";

export async function currentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return findUserBySessionToken(token);
}
