import { requireActor } from "@/lib/actors";
import { removeTarget, setTarget } from "@/lib/flags";
import { handle, isRecord, json, readJson } from "@/lib/http";
import { parseEnabled, parseExternalId } from "@/lib/validate";

type Context = { params: Promise<{ key: string }> };

export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireActor(request);
    const { key } = await context.params;
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const flag = await setTarget(actor, key, parseExternalId(body.userId), parseEnabled(body.allowed));
    return json({ flag });
  });
}

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireActor(request);
    const { key } = await context.params;
    const userId = new URL(request.url).searchParams.get("userId");
    const flag = await removeTarget(actor, key, parseExternalId(userId));
    return json({ flag });
  });
}
