import { requireActor } from "@/lib/actors";
import { listAudit } from "@/lib/audit";
import { handle, json } from "@/lib/http";

export async function GET(request: Request) {
  return handle(async () => {
    await requireActor(request);
    const flag = new URL(request.url).searchParams.get("flag")?.trim();
    return json({ events: await listAudit(flag || undefined) });
  });
}
