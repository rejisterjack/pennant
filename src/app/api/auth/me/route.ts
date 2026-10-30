import { requireActor } from "@/lib/actors";
import { handle, json } from "@/lib/http";

export async function GET(request: Request) {
  return handle(async () => {
    const actor = await requireActor(request);
    return json({ user: actor });
  });
}
