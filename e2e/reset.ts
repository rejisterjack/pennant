import pg from "pg";

export async function resetDatabase(): Promise<void> {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      'TRUNCATE TABLE "AuditEvent", "FlagTarget", "Flag", "ApiKey", "Session", "User" CASCADE',
    );
  } finally {
    await client.end();
  }
}
