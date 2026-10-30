import { revokeApiKey } from "@/lib/api-keys";
import { requireAdmin } from "@/lib/actors";
import { handle, json } from "@/lib/http";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    await requireAdmin(request);
    const { id } = await context.params;
    await revokeApiKey(id);
    return json({ ok: true });
  });
}
