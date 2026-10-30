import { logout } from "@/lib/auth";
import { readSessionToken, sessionCookie } from "@/lib/cookies";
import { handle, json } from "@/lib/http";

export async function POST(request: Request) {
  return handle(async () => {
    await logout(readSessionToken(request));
    return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
  });
}
