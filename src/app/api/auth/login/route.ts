import { login } from "@/lib/auth";
import { sessionCookie } from "@/lib/cookies";
import { handle, isRecord, json, readJson } from "@/lib/http";
import { parseEmail, parsePassword } from "@/lib/validate";

export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const result = await login({
      email: parseEmail(body.email),
      password: parsePassword(body.password),
    });
    return json({ user: result.actor }, 200, { "set-cookie": sessionCookie(result.token) });
  });
}
