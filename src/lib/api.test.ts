import assert from "node:assert/strict";
import { after, beforeEach, describe, it } from "node:test";
import { POST as setup } from "../app/api/auth/setup/route.ts";
import { POST as login } from "../app/api/auth/login/route.ts";
import { GET as me } from "../app/api/auth/me/route.ts";
import { POST as createFlag, GET as listFlags } from "../app/api/flags/route.ts";
import { PATCH as updateFlag } from "../app/api/flags/[key]/route.ts";
import { POST as createUser } from "../app/api/users/route.ts";
import { POST as createKey } from "../app/api/api-keys/route.ts";
import { DELETE as revokeKey } from "../app/api/api-keys/[id]/route.ts";
import { GET as evaluate } from "../app/api/v1/evaluate/route.ts";
import { GET as audit } from "../app/api/audit/route.ts";
import { GET as health } from "../app/api/health/route.ts";
import { db } from "../prisma/db.ts";

async function resetDatabase() {
  const plan = db.raw
    .sql`TRUNCATE TABLE "AuditEvent", "FlagTarget", "Flag", "ApiKey", "Session", "User" CASCADE`
    .affectedCount()
    .build();
  await db.execute(plan);
}

function jsonRequest(path: string, body: unknown, cookie?: string) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function cookieFrom(response: Response) {
  const raw = response.headers.get("set-cookie") ?? "";
  const pair = raw.split(";")[0];
  assert.ok(pair?.startsWith("pennant_session="));
  return pair;
}

async function asAdmin() {
  const response = await setup(
    jsonRequest("/api/auth/setup", {
      email: "ada@example.com",
      password: "correct-horse",
      name: "Ada",
    }),
  );
  assert.equal(response.status, 201);
  return cookieFrom(response);
}

after(async () => {
  await db.close();
});

describe("HTTP API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("answers health checks", async () => {
    const response = await health();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await response.json(), { ok: true });
  });

  it("allows setup only once and then signs in with the session cookie", async () => {
    const cookie = await asAdmin();
    const again = await setup(
      jsonRequest("/api/auth/setup", {
        email: "grace@example.com",
        password: "correct-horse",
        name: "Grace",
      }),
    );
    assert.equal(again.status, 409);

    const session = await me(new Request("http://localhost/api/auth/me", { headers: { cookie } }));
    assert.equal(session.status, 200);
    const body = (await session.json()) as { user: { email: string; role: string } };
    assert.equal(body.user.email, "ada@example.com");
    assert.equal(body.user.role, "admin");

    const signedOut = await me(new Request("http://localhost/api/auth/me"));
    assert.equal(signedOut.status, 401);
  });

  it("rejects a bad password", async () => {
    await asAdmin();
    const response = await login(
      jsonRequest("/api/auth/login", { email: "ada@example.com", password: "wrong-password" }),
    );
    assert.equal(response.status, 401);
  });

  it("lets members manage flags and reserves keys and teammates for admins", async () => {
    const admin = await asAdmin();
    const memberResponse = await createUser(
      jsonRequest(
        "/api/users",
        { email: "grace@example.com", password: "correct-horse", name: "Grace", role: "member" },
        admin,
      ),
    );
    assert.equal(memberResponse.status, 201);

    const memberLogin = await login(
      jsonRequest("/api/auth/login", { email: "grace@example.com", password: "correct-horse" }),
    );
    const member = cookieFrom(memberLogin);

    const created = await createFlag(
      jsonRequest("/api/flags", { key: "new-checkout", name: "New checkout" }, member),
    );
    assert.equal(created.status, 201);

    const forbiddenKey = await createKey(jsonRequest("/api/api-keys", { name: "ci" }, member));
    assert.equal(forbiddenKey.status, 403);
    const forbiddenUser = await createUser(
      jsonRequest(
        "/api/users",
        { email: "linus@example.com", password: "correct-horse", name: "Linus" },
        member,
      ),
    );
    assert.equal(forbiddenUser.status, 403);
  });

  it("requires an API key, rejects a revoked key, and follows a toggle", async () => {
    const admin = await asAdmin();
    const missing = await evaluate(new Request("http://localhost/api/v1/evaluate?flag=new-checkout"));
    assert.equal(missing.status, 401);

    const created = await createFlag(
      jsonRequest("/api/flags", { key: "new-checkout", name: "New checkout", enabled: false }, admin),
    );
    assert.equal(created.status, 201);

    const keyResponse = await createKey(jsonRequest("/api/api-keys", { name: "sdk" }, admin));
    assert.equal(keyResponse.status, 201);
    const keyBody = (await keyResponse.json()) as { key: { id: string; secret: string } };

    const off = await evaluate(
      new Request("http://localhost/api/v1/evaluate?flag=new-checkout", {
        headers: { authorization: `Bearer ${keyBody.key.secret}` },
      }),
    );
    assert.equal(off.status, 200);
    assert.deepEqual(await off.json(), { enabled: false });

    const toggled = await updateFlag(
      jsonRequest("/api/flags/new-checkout", { enabled: true }, admin),
      { params: Promise.resolve({ key: "new-checkout" }) },
    );
    assert.equal(toggled.status, 200);

    const on = await evaluate(
      new Request("http://localhost/api/v1/evaluate?flag=new-checkout&userId=ada", {
        headers: { authorization: `Bearer ${keyBody.key.secret}` },
      }),
    );
    assert.deepEqual(await on.json(), { enabled: true });

    const log = await audit(new Request("http://localhost/api/audit?flag=new-checkout", { headers: { cookie: admin } }));
    const events = (await log.json()) as { events: { actorEmail: string; action: string }[] };
    assert.ok(events.events.some((event) => event.action === "updated" && event.actorEmail === "ada@example.com"));

    const revoked = await revokeKey(new Request("http://localhost/api/api-keys/x", { method: "DELETE" }), {
      params: Promise.resolve({ id: keyBody.key.id }),
    });
    // revoke route requires the admin cookie
    assert.equal(revoked.status, 401);
    const revokedAsAdmin = await revokeKey(
      new Request("http://localhost/api/api-keys/x", { method: "DELETE", headers: { cookie: admin } }),
      { params: Promise.resolve({ id: keyBody.key.id }) },
    );
    assert.equal(revokedAsAdmin.status, 200);

    const after = await evaluate(
      new Request("http://localhost/api/v1/evaluate?flag=new-checkout", {
        headers: { authorization: `Bearer ${keyBody.key.secret}` },
      }),
    );
    assert.equal(after.status, 401);
  });

  it("lists flags for a signed-in user", async () => {
    const admin = await asAdmin();
    const response = await listFlags(new Request("http://localhost/api/flags", { headers: { cookie: admin } }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { flags: [] });
  });
});
