import { createApiKey, listApiKeys } from "@/lib/api-keys";
import { requireAdmin } from "@/lib/actors";
import { handle, isRecord, json, readJson } from "@/lib/http";
import { parseName } from "@/lib/validate";

export async function GET(request: Request) {
  return handle(async () => {
    await requireAdmin(request);
    return json({ keys: await listApiKeys() });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const actor = await requireAdmin(request);
    const body = await readJson(request);
    if (!isRecord(body)) return json({ error: "Invalid JSON" }, 400);
    const key = await createApiKey(actor, parseName(body.name));
    return json({ key }, 201);
  });
}
