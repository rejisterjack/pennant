import { requireApiKey } from "@/lib/actors";
import { listFlags } from "@/lib/flags";
import { handle, json } from "@/lib/http";

export async function GET(request: Request) {
  return handle(async () => {
    await requireApiKey(request);
    const flags = await listFlags();
    return json({
      flags: flags.map((flag) => ({
        key: flag.key,
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        rolloutPercent: flag.rolloutPercent,
        targets: flag.targets,
      })),
    });
  });
}
