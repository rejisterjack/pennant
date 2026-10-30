import { requireActor } from "@/lib/actors";
import { createFlag, listFlags } from "@/lib/flags";
import { handle, isRecord, json, readJson } from "@/lib/http";
import { parseDescription, parseEnabled, parseFlagKey, parseName, parseRollout } from "@/lib/validate";

export async function GET(request: Request) {
  return handle(async () => {
    await requireActor(request);
    return json({ flags: await listFlags() });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const actor = await requireActor(request);
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const flag = await createFlag(actor, {
      key: parseFlagKey(body.key),
      name: parseName(body.name),
      description: parseDescription(body.description),
      enabled: body.enabled === undefined ? false : parseEnabled(body.enabled),
      rolloutPercent: body.rolloutPercent === undefined ? 100 : parseRollout(body.rolloutPercent),
    });
    return json({ flag }, 201);
  });
}
