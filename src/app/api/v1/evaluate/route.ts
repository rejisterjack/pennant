import { requireApiKey } from "@/lib/actors";
import { evaluateForApi } from "@/lib/flags";
import { handle, HttpError, json } from "@/lib/http";

export async function GET(request: Request) {
  return handle(async () => {
    await requireApiKey(request);
    const url = new URL(request.url);
    const flag = url.searchParams.get("flag")?.trim();
    if (!flag) throw new HttpError(400, "flag is required");
    if (flag.length > 200) throw new HttpError(400, "flag is too long");
    const userId = url.searchParams.get("userId")?.trim() || undefined;
    if (userId && userId.length > 200) throw new HttpError(400, "userId is too long");
    const result = await evaluateForApi(flag, userId);
    return json({ enabled: result.enabled });
  });
}
