import { login } from "@/lib/auth";
import { sessionCookie } from "@/lib/cookies";
import { handle, HttpError, isRecord, json, readJson } from "@/lib/http";
import { loginBlocked, recordLoginFailure, requestIp } from "@/lib/rate-limit";
import { parseEmail, parsePassword } from "@/lib/validate";

export async function POST(request: Request) {
  return handle(async () => {
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const email = parseEmail(body.email);
    const password = parsePassword(body.password);
    const bucket = `${requestIp(request)}:${email}`;
    if (loginBlocked(bucket)) throw new HttpError(429, "Too many attempts. Try again later.");
    try {
      const result = await login({ email, password });
      return json({ user: result.actor }, 200, { "set-cookie": sessionCookie(result.token) });
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) recordLoginFailure(bucket);
      throw error;
    }
  });
}
