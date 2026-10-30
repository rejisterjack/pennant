import { requireAdmin } from "@/lib/actors";
import { handle, json } from "@/lib/http";
import { deleteTeammate } from "@/lib/team";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireAdmin(request);
    const { id } = await context.params;
    await deleteTeammate(actor, id);
    return json({ ok: true });
  });
}
