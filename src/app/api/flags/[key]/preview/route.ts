import { requireActor } from "@/lib/actors";
import { previewFlag } from "@/lib/flags";
import { handle, isRecord, json, readJson } from "@/lib/http";
import { parseExternalId } from "@/lib/validate";

type Context = { params: Promise<{ key: string }> };

export async function POST(request: Request, context: Context) {
  return handle(async () => {
    await requireActor(request);
    const { key } = await context.params;
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const userId = body.userId === undefined || body.userId === "" ? undefined : parseExternalId(body.userId);
    const result = await previewFlag(key, userId);
    return json(result);
  });
}
