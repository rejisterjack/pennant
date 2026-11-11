import assert from "node:assert/strict";
import { after, beforeEach, describe, it } from "node:test";
import { POST as setup } from "../app/api/auth/setup/route.ts";
import { POST as login } from "../app/api/auth/login/route.ts";
import { GET as me } from "../app/api/auth/me/route.ts";
import { POST as createFlag, GET as listFlags } from "../app/api/flags/route.ts";
import { PATCH as updateFlag } from "../app/api/flags/[key]/route.ts";
import { POST as createUser, GET as listUsers } from "../app/api/users/route.ts";
import { DELETE as deleteUser } from "../app/api/users/[id]/route.ts";
import { GET as listKeys } from "../app/api/api-keys/route.ts";
import { POST as createKey } from "../app/api/api-keys/route.ts";
import { DELETE as revokeKey } from "../app/api/api-keys/[id]/route.ts";
import { GET as evaluate } from "../app/api/v1/evaluate/route.ts";
import { GET as publicFlags } from "../app/api/v1/flags/route.ts";
import { DELETE as deleteFlag } from "../app/api/flags/[key]/route.ts";
import { POST as setTarget, DELETE as removeTarget } from "../app/api/flags/[key]/targets/route.ts";
import { POST as preview } from "../app/api/flags/[key]/preview/route.ts";
import { POST as logout } from "../app/api/auth/logout/route.ts";
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
    const forbiddenDelete = await deleteUser(
      new Request("http://localhost/api/users/someone", { method: "DELETE", headers: { cookie: member } }),
      { params: Promise.resolve({ id: "someone" }) },
    );
    assert.equal(forbiddenDelete.status, 403);
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
    const listed = await listKeys(new Request("http://localhost/api/api-keys", { headers: { cookie: admin } }));
    assert.equal(JSON.stringify(await listed.json()).includes(keyBody.key.secret), false);

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

  it("targets a user, previews the result, logs out, and deletes the flag", async () => {
    const admin = await asAdmin();
    const created = await createFlag(
      jsonRequest("/api/flags", { key: "billing", name: "Billing", enabled: true, rolloutPercent: 0 }, admin),
    );
    assert.equal(created.status, 201);

    const targeted = await setTarget(
      jsonRequest("/api/flags/billing/targets", { userId: "ada", allowed: true }, admin),
      { params: Promise.resolve({ key: "billing" }) },
    );
    assert.equal(targeted.status, 200);

    const looked = await preview(
      jsonRequest("/api/flags/billing/preview", { userId: "ada" }, admin),
      { params: Promise.resolve({ key: "billing" }) },
    );
    assert.deepEqual(await looked.json(), { enabled: true, reason: "target_allow" });

    const keyResponse = await createKey(jsonRequest("/api/api-keys", { name: "sdk" }, admin));
    const secret = ((await keyResponse.json()) as { key: { secret: string } }).key.secret;
    const defs = await publicFlags(
      new Request("http://localhost/api/v1/flags", { headers: { authorization: `Bearer ${secret}` } }),
    );
    assert.equal(defs.status, 200);
    const body = (await defs.json()) as { flags: { key: string; targets: { userId: string }[] }[] };
    assert.equal(body.flags[0]?.key, "billing");
    assert.equal(body.flags[0]?.targets[0]?.userId, "ada");

    const tooLong = await evaluate(
      new Request(`http://localhost/api/v1/evaluate?flag=${"a".repeat(201)}`, {
        headers: { authorization: `Bearer ${secret}` },
      }),
    );
    assert.equal(tooLong.status, 400);

    const cleared = await removeTarget(
      new Request("http://localhost/api/flags/billing/targets?userId=ada", {
        method: "DELETE",
        headers: { cookie: admin },
      }),
      { params: Promise.resolve({ key: "billing" }) },
    );
    assert.equal(cleared.status, 200);

    const signedOut = await logout(new Request("http://localhost/api/auth/logout", { method: "POST", headers: { cookie: admin } }));
    assert.equal(signedOut.status, 200);
    const meAfter = await me(new Request("http://localhost/api/auth/me", { headers: { cookie: admin } }));
    assert.equal(meAfter.status, 401);

    const relogin = await login(jsonRequest("/api/auth/login", { email: "ada@example.com", password: "correct-horse" }));
    const cookie = cookieFrom(relogin);
    const removed = await deleteFlag(
      new Request("http://localhost/api/flags/billing", { method: "DELETE", headers: { cookie } }),
      { params: Promise.resolve({ key: "billing" }) },
    );
    assert.equal(removed.status, 200);
    const log = await audit(new Request("http://localhost/api/audit?flag=billing", { headers: { cookie } }));
    const events = (await log.json()) as { events: { action: string; summary: string | null }[] };
    assert.ok(events.events.some((event) => event.action === "deleted" && event.summary === "Flag deleted"));
    assert.ok(events.events.some((event) => event.action === "targeting_changed" && event.summary?.includes("ada")));
  });

  it("keeps the last admin, expires sessions, upserts targets, and filters the audit log", async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    let cookie: string;
    try {
      const created = await setup(
        jsonRequest("/api/auth/setup", {
          email: "Ada@Example.com",
          password: "correct-horse",
          name: "Ada",
        }),
      );
      assert.equal(created.status, 201);
      const setCookie = created.headers.get("set-cookie") ?? "";
      assert.match(setCookie, /HttpOnly/);
      assert.match(setCookie, /SameSite=Lax/);
      assert.match(setCookie, /Secure/);
      cookie = cookieFrom(created);
    } finally {
      if (previousEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnv;
    }

    const session = await me(new Request("http://localhost/api/auth/me", { headers: { cookie } }));
    const adminId = ((await session.json()) as { user: { id: string } }).user.id;
    const stored = await db.orm.public.User.whereUnique({ email: "ada@example.com" }).first();
    assert.match(stored?.passwordHash ?? "", /^scrypt:/);

    const second = await createUser(
      jsonRequest(
        "/api/users",
        { email: "linus@example.com", password: "correct-horse", name: "Linus", role: "admin" },
        cookie,
      ),
    );
    assert.equal(second.status, 201);
    const secondId = ((await second.json()) as { user: { id: string } }).user.id;
    const removed = await deleteUser(
      new Request(`http://localhost/api/users/${secondId}`, { method: "DELETE", headers: { cookie } }),
      { params: Promise.resolve({ id: secondId }) },
    );
    assert.equal(removed.status, 200);
    const last = await deleteUser(
      new Request(`http://localhost/api/users/${adminId}`, { method: "DELETE", headers: { cookie } }),
      { params: Promise.resolve({ id: adminId }) },
    );
    assert.equal(last.status, 400);

    const sessions = await db.orm.public.Session.all();
    assert.equal(sessions.length, 1);
    await db.orm.public.Session.whereUnique({ id: sessions[0]!.id }).update({
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    const expired = await me(new Request("http://localhost/api/auth/me", { headers: { cookie } }));
    assert.equal(expired.status, 401);

    const again = await login(
      jsonRequest("/api/auth/login", { email: "ada@example.com", password: "correct-horse" }),
    );
    cookie = cookieFrom(again);
    await createFlag(jsonRequest("/api/flags", { key: "billing", name: "Billing" }, cookie));
    await createFlag(jsonRequest("/api/flags", { key: "search", name: "Search" }, cookie));
    await setTarget(
      jsonRequest("/api/flags/billing/targets", { userId: "ada", allowed: true }, cookie),
      { params: Promise.resolve({ key: "billing" }) },
    );
    const replaced = await setTarget(
      jsonRequest("/api/flags/billing/targets", { userId: "ada", allowed: false }, cookie),
      { params: Promise.resolve({ key: "billing" }) },
    );
    const targets = ((await replaced.json()) as { flag: { targets: { userId: string; allowed: boolean }[] } }).flag
      .targets;
    assert.deepEqual(targets, [{ userId: "ada", allowed: false }]);

    const filtered = await audit(
      new Request("http://localhost/api/audit?flag=billing", { headers: { cookie } }),
    );
    const events = ((await filtered.json()) as { events: { flagKey: string }[] }).events;
    assert.ok(events.length > 0);
    assert.ok(events.every((event) => event.flagKey === "billing"));
    const all = await audit(new Request("http://localhost/api/audit", { headers: { cookie } }));
    const allKeys = ((await all.json()) as { events: { flagKey: string }[] }).events.map((event) => event.flagKey);
    assert.ok(allKeys.includes("search"));
  });

  it("returns the same failure for an unknown email and a wrong password", async () => {
    await asAdmin();
    const unknown = await login(
      jsonRequest("/api/auth/login", { email: "nobody@example.com", password: "wrong-password" }),
    );
    const wrong = await login(
      jsonRequest("/api/auth/login", { email: "ada@example.com", password: "wrong-password" }),
    );
    assert.equal(unknown.status, 401);
    assert.equal(wrong.status, 401);
    assert.deepEqual(await unknown.json(), await wrong.json());
  });

  it("blocks the ninth failed sign-in without revealing whether the email exists", async () => {
    const body = { email: "locked@example.com", password: "wrong-password" };
    let last: Response | undefined;
    for (let attempt = 0; attempt < 9; attempt += 1) {
      last = await login(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.20",
          },
          body: JSON.stringify(body),
        }),
      );
    }
    assert.ok(last);
    assert.equal(last.status, 429);
    const payload = (await last.json()) as { error: string };
    assert.equal(payload.error, "Too many attempts. Try again later.");
    assert.equal(payload.error.includes("locked@example.com"), false);
  });

  it("lets only one of two simultaneous setups create the admin", async () => {
    const [first, second] = await Promise.all([
      setup(jsonRequest("/api/auth/setup", { email: "ada@example.com", password: "correct-horse", name: "Ada" })),
      setup(jsonRequest("/api/auth/setup", { email: "grace@example.com", password: "correct-horse", name: "Grace" })),
    ]);
    const statuses = [first.status, second.status].sort();
    assert.deepEqual(statuses, [201, 409]);
    const users = await db.orm.public.User.all();
    assert.equal(users.length, 1);
    assert.equal(users[0]?.role, "admin");
  });

  it("does not let two admins delete each other at the same time", async () => {
    const ada = await asAdmin();
    const created = await createUser(
      jsonRequest(
        "/api/users",
        { email: "linus@example.com", password: "correct-horse", name: "Linus", role: "admin" },
        ada,
      ),
    );
    const linusId = ((await created.json()) as { user: { id: string } }).user.id;
    const linusLogin = await login(
      jsonRequest("/api/auth/login", { email: "linus@example.com", password: "correct-horse" }),
    );
    const linus = cookieFrom(linusLogin);
    const adaId = (
      (await (await me(new Request("http://localhost/api/auth/me", { headers: { cookie: ada } }))).json()) as {
        user: { id: string };
      }
    ).user.id;

    const [dropLinus, dropAda] = await Promise.all([
      deleteUser(new Request(`http://localhost/api/users/${linusId}`, { method: "DELETE", headers: { cookie: ada } }), {
        params: Promise.resolve({ id: linusId }),
      }),
      deleteUser(new Request(`http://localhost/api/users/${adaId}`, { method: "DELETE", headers: { cookie: linus } }), {
        params: Promise.resolve({ id: adaId }),
      }),
    ]);
    const statuses = [dropLinus.status, dropAda.status].sort();
    assert.deepEqual(statuses, [200, 400]);
    const remaining = await listUsers(new Request("http://localhost/api/users", { headers: { cookie: ada } }));
    const cookieForList = remaining.status === 401 ? linus : ada;
    const roster =
      remaining.status === 200
        ? remaining
        : await listUsers(new Request("http://localhost/api/users", { headers: { cookie: cookieForList } }));
    const users = ((await roster.json()) as { users: { role: string }[] }).users;
    assert.equal(users.length, 1);
    assert.equal(users[0]?.role, "admin");
  });

  it("rejects invalid JSON", async () => {
    const admin = await asAdmin();
    const response = await createFlag(
      new Request("http://localhost/api/flags", {
        method: "POST",
        headers: { "content-type": "application/json", cookie: admin },
        body: "{",
      }),
    );
    assert.equal(response.status, 400);
  });

  it("lists flags for a signed-in user", async () => {
    const admin = await asAdmin();
    const response = await listFlags(new Request("http://localhost/api/flags", { headers: { cookie: admin } }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { flags: [] });
  });
});
