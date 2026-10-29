import { requireApiKey } from "@/lib/actors";
import { evaluateForApi } from "@/lib/flags";
import { handle, HttpError, json } from "@/lib/http";

export async function GET(request: Request) {
  return handle(async () => {
    await requireApiKey(request);
    const url = new URL(request.url);
    const flag = url.searchParams.get("flag")?.trim();
    if (!flag) throw new HttpError(400, "flag is required");
    const userId = url.searchParams.get("userId")?.trim() || undefined;
    const result = await evaluateForApi(flag, userId);
    return json({ enabled: result.enabled });
  });
}
