import { db } from "@/prisma/db";
import { json } from "@/lib/http";

export async function GET() {
  try {
    const plan = db.raw.sql`SELECT 1 AS ok`.returnsRow({ ok: "pg/int4@1" }).build();
    await db.query(plan);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ ok: false }, 503);
  }
}
