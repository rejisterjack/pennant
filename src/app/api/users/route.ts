import { requireActor, requireAdmin } from "@/lib/actors";
import { handle, isRecord, json, readJson } from "@/lib/http";
import { createTeammate, listTeam } from "@/lib/team";
import { parseEmail, parseName, parsePassword, parseRole } from "@/lib/validate";

export async function GET(request: Request) {
  return handle(async () => {
    await requireActor(request);
    return json({ users: await listTeam() });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    await requireAdmin(request);
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const user = await createTeammate({
      email: parseEmail(body.email),
      password: parsePassword(body.password),
      name: parseName(body.name),
      role: parseRole(body.role),
    });
    return json({ user }, 201);
  });
}
