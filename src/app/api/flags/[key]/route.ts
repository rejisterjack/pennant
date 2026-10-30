import { requireActor } from "@/lib/actors";
import { deleteFlag, getFlag, updateFlag } from "@/lib/flags";
import { handle, isRecord, json, readJson } from "@/lib/http";
import { parseDescription, parseEnabled, parseName, parseRollout } from "@/lib/validate";

type Context = { params: Promise<{ key: string }> };

export async function GET(request: Request, context: Context) {
  return handle(async () => {
    await requireActor(request);
    const { key } = await context.params;
    return json({ flag: await getFlag(key) });
  });
}

export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireActor(request);
    const { key } = await context.params;
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const flag = await updateFlag(actor, key, {
      name: body.name === undefined ? undefined : parseName(body.name),
      description: body.description === undefined ? undefined : parseDescription(body.description),
      enabled: body.enabled === undefined ? undefined : parseEnabled(body.enabled),
      rolloutPercent:
        body.rolloutPercent === undefined ? undefined : parseRollout(body.rolloutPercent),
    });
    return json({ flag });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireActor(request);
    const { key } = await context.params;
    await deleteFlag(actor, key);
    return json({ ok: true });
  });
}
