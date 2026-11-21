# Ship Readiness Report — Pennant

Pennant is a self-hosted feature-flag service. An operator creates a flag in the Next.js dashboard, and an app checks it with the server SDK or with GET /api/v1/evaluate.
A flag is off, on for everyone, a stable percentage of user ids, or forced on or off for one named user. Each change is an audit event.
The first account is created at /setup and is an admin. Later people sign in with email and password. Apps use a separate pn_ API key. Members can edit flags. Only an admin manages keys and the team.
One deployment is one environment, on Vercel with Neon, or locally with Postgres 15 or newer. The reference site is https://pennant.rejisterjack.com and the README says that instance is private.
This report only reads the tree. Nothing was started, migrated, or changed. Every feature below is NOT STARTED.

## Feature Table

| ID | Feature | Priority | Status | Bugs Found | Bugs Fixed | UI Issues Fixed | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DATA-01 | Postgres schema and migration | P0 | PASSED | 0 | 0 | 0 | Fresh Postgres 16 on 127.0.0.1:54331. Six tables. Rollout 101 rejected by flag_rollout_range. Second migrate left the existing flag. |
| DATA-02 | Pooled runtime URL and direct migration URL | P0 | PASSED | 0 | 0 | 0 | Runtime uses DATABASE_URL. Migrations use DIRECT_URL, then DATABASE_URL. vercel.json migrates before the build. A missing or 5-character AUTH_SECRET throws. |
| EVAL-01 | Rollout decision | P0 | PASSED | 0 | 0 | 0 | evaluate.test.ts 9/9. Spaces are no-user. Long, Japanese, emoji, SQL, and markup ids are stable. A trimmed id matches a force-on target while the flag is off. |
| EVAL-02 | GET /api/v1/evaluate | P0 | PASSED | 0 | 0 | 0 | No token, short token, and a session bearer are 401. Unknown flag is enabled false. Over-long flag and user id are 400. |
| EVAL-03 | GET /api/v1/flags | P1 | NOT STARTED | | | | |
| EVAL-04 | Evaluate responses are not cached by a CDN | P0 | NOT STARTED | | | | |
| AUTH-01 | First admin setup | P0 | NOT STARTED | | | | |
| AUTH-02 | Email and password session | P0 | NOT STARTED | | | | |
| AUTH-03 | Sign out | P0 | NOT STARTED | | | | |
| AUTH-04 | Admin and member roles | P0 | NOT STARTED | | | | |
| AUTH-05 | Login failure limit | P0 | NOT STARTED | | | | |
| AUTH-06 | Login error does not reveal which part failed | P1 | NOT STARTED | | | | |
| APIKEY-01 | Create and list API keys | P0 | NOT STARTED | | | | |
| APIKEY-02 | Revoke an API key | P0 | NOT STARTED | | | | |
| FLAG-01 | Create, read, and delete a flag | P0 | NOT STARTED | | | | |
| FLAG-02 | Toggle and rollout percent | P0 | NOT STARTED | | | | |
| FLAG-03 | Per-user force on and force off | P0 | NOT STARTED | | | | |
| FLAG-04 | Preview a user against a flag | P1 | NOT STARTED | | | | |
| FLAG-05 | Flag key shape | P1 | NOT STARTED | | | | |
| AUDIT-01 | Audit row on a flag change | P0 | NOT STARTED | | | | |
| AUDIT-02 | List and filter the audit log | P1 | NOT STARTED | | | | |
| AUDIT-03 | Readable audit summaries | P2 | NOT STARTED | | | | |
| TEAM-01 | Admin adds a teammate | P0 | NOT STARTED | | | | |
| TEAM-02 | Admin removes a member | P0 | NOT STARTED | | | | |
| TEAM-03 | The last admin cannot be deleted | P0 | NOT STARTED | | | | |
| UI-01 | Flags list and empty state | P0 | NOT STARTED | | | | |
| UI-02 | Flag detail editor | P0 | NOT STARTED | | | | |
| UI-03 | New flag form | P0 | NOT STARTED | | | | |
| UI-04 | Setup and login screens | P0 | NOT STARTED | | | | |
| UI-05 | API keys and team settings | P0 | NOT STARTED | | | | |
| UI-06 | Audit page | P1 | NOT STARTED | | | | |
| UI-07 | Public home page | P2 | NOT STARTED | | | | |
| UI-08 | Signed-in shell | P1 | NOT STARTED | | | | |
| UI-09 | Not found and error pages | P1 | NOT STARTED | | | | |
| UI-10 | Crawl policy | P2 | NOT STARTED | | | | |
| SEO-01 | Document title, description, and icon | P1 | NOT STARTED | | | | |
| SDK-01 | Server SDK package | P0 | NOT STARTED | | | | |
| SDK-02 | isEnabled calls evaluate | P0 | NOT STARTED | | | | |
| SDK-03 | Cache and default value | P1 | NOT STARTED | | | | |
| SEC-01 | Security headers | P1 | NOT STARTED | | | | |
| SEC-02 | Health check | P0 | NOT STARTED | | | | |
| SEC-03 | Concurrent evaluate load | P2 | NOT STARTED | | | | |
| HTTP-01 | Session required on dashboard APIs | P0 | NOT STARTED | | | | |
| DEVOPS-01 | GitHub Actions CI | P0 | NOT STARTED | | | | |
| DEVOPS-02 | Vercel and Neon deploy shape | P0 | NOT STARTED | | | | |
| DEVOPS-03 | SDK publish workflow | P2 | NOT STARTED | | | | |
| TEST-01 | Node test suite | P0 | NOT STARTED | | | | |
| TEST-02 | Playwright operator journeys | P0 | NOT STARTED | | | | |
| TEST-03 | Health-down script | P2 | NOT STARTED | | | | |

## Gaps

| ID | Gap | Decision | Reason |
| --- | --- | --- | --- |
| GAP-01 | Audience segments | DEFER | The README lists segments as won't-build. Per-user force on and off is the targeting that exists. |
| GAP-02 | Flag-change webhooks | DEFER | The README says the audit log is the change record. |
| GAP-03 | A/B experiments and analytics | DEFER | VISION.md limits the product to flags and rollout. |
| GAP-04 | Several environments in one deployment | DEFER | The README says a second deploy is the staging environment. |
| GAP-05 | OAuth or SSO | DEFER | Sign-in is email and password only. |
| GAP-06 | Email invites and password reset | DEFER | The README says Pennant does not send email. An admin sets the teammate password. |
| GAP-07 | Browser SDK | DEFER | The SDK README says the API key must not be put in browser code. |
| GAP-08 | Billing and multiple organizations | DEFER | One deployment is a single team, not a billed SaaS. |
| GAP-09 | Theme toggle | DEFER | globals.css is one light paper theme. There is no dark theme in the source. |

Deferred gaps are not feature rows. There is no BUILD gap. The not-found page and the error page already exist.

## Per-Feature Sections

### DATA-01 Postgres schema and migration

- **Status:** PASSED
- **Priority:** P0
- **Files:** src/prisma/contract.prisma, migrations/app/20261028T2019_init, src/prisma/db.ts
- **Expected behavior:** The schema has users, sessions, API keys, flags, per-user targets, and audit events. Flag rollout is checked in the database to the range 0 through 100. A target is unique per flag and external id. Deleting a user cascades sessions and keys. Deleting a flag cascades its targets. The build command runs prisma db migrate before next build.
- **Acceptance:**
- [x] A fresh database applies the init migration and the six models exist.
- [x] A rollout outside 0 through 100 is rejected by the check constraint.
- [x] Running the migration again does not drop existing flags.
- **Test cases:**
- Apply the migration to an empty Postgres 16 database and list the tables.
- Insert a flag with rollout 101 and confirm the database rejects it.
- Run the migration a second time and confirm the existing row is still there.
- **Dependencies:** Postgres 15 or newer, DATABASE_URL and DIRECT_URL.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:** 0
- **Bugs Fixed:** 0
- **UI Issues Fixed:** 0
- **Files Changed:** none
- **Notes:** Applied `20261028T2019_init` to an empty Postgres 16. Tables: ApiKey, AuditEvent, Flag, FlagTarget, Session, User. Insert of rollout 101 failed with flag_rollout_range_a4fb22dd. A second `prisma db migrate` reported already up to date and the flag at 10% was still there. Probe row deleted afterward.

### DATA-02 Pooled runtime URL and direct migration URL

- **Status:** PASSED
- **Priority:** P0
- **Files:** README.md, .env.example, vercel.json, prisma.config.ts
- **Expected behavior:** Runtime queries use DATABASE_URL. Migrations use DIRECT_URL. On Neon those are the pooled host and the direct host. A local database may use the same value for both. The Vercel build command is prisma db migrate && next build.
- **Acceptance:**
- [x] The example env documents both variables and which host is pooled.
- [x] vercel.json build command migrates before the Next build.
- [x] A missing AUTH_SECRET of at least 16 characters fails closed in authSecret().
- **Test cases:**
- Read prisma.config.ts and confirm the two URLs are wired to the documented roles.
- Start is not required. Do not connect to a production database.
- **Dependencies:** DATA-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:** 0
- **Bugs Fixed:** 0
- **UI Issues Fixed:** 0
- **Files Changed:** none
- **Notes:** prisma.config.ts connects migrations with DIRECT_URL ?? DATABASE_URL. src/prisma/db.ts uses DATABASE_URL. .env.example says the pooled host contains -pooler and the direct host does not. vercel.json buildCommand is `prisma db migrate && next build`. authSecret() threw for an unset secret and for `short`, and returned a 16-character secret.

### EVAL-01 Rollout decision

- **Status:** PASSED
- **Priority:** P0
- **Files:** src/lib/evaluate.ts, src/lib/evaluate.test.ts
- **Expected behavior:** An unknown flag is off with reason missing. A matching target wins, even when the flag is off or the percent is 100. Otherwise a disabled flag is off. At 100 percent everyone else is on, including a check with no user id. Below 100 percent a missing user id is off, and a user is on only when the SHA-256 bucket of flagKey:userId is strictly below the percent. The bucket is stable.
- **Acceptance:**
- [x] The same flag and user always get the same bucket.
- [x] A force-on target is on while the flag is disabled.
- [x] A force-off target is off at 100 percent.
- [x] Whitespace around a user id is trimmed before the lookup.
- **Test cases:**
- Run the evaluate unit tests.
- Check a user id of spaces, a very long id, and a non-English id through the pure function.
- Confirm 0 percent is off except for a force-on target.
- **Dependencies:** None. This function does not touch the database.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:** 0
- **Bugs Fixed:** 0
- **UI Issues Fixed:** 0
- **Files Changed:** none
- **Notes:** `tsx --test src/lib/evaluate.test.ts` passed 9 tests. Extra calls: whitespace-only ids are rollout_no_user; a 5000-character id, ユーザー-東京, an emoji id, a SQL fragment, markup, and a path-like id each returned the same result twice. `  ユーザー-東京  ` matched a force-on target while the flag was disabled and the percent was 0.

### EVAL-02 GET /api/v1/evaluate

- **Status:** PASSED
- **Priority:** P0
- **Files:** src/app/api/v1/evaluate/route.ts, src/lib/flags.ts, src/lib/actors.ts
- **Expected behavior:** The route requires a bearer API key. The flag query is required and limited to 200 characters. userId is optional and limited to 200 characters. The JSON body is only enabled true or false. A missing flag is a successful response of enabled false, not a 404.
- **Acceptance:**
- [x] A valid key and an existing flag return enabled.
- [x] A missing flag query is 400.
- [x] A missing, revoked, or session token is 401.
- [x] A flag longer than 200 characters is 400.
- **Test cases:**
- Call with no token, a short token, a session cookie, and a revoked key.
- Call with an empty flag, a flag of spaces, and a 201-character flag.
- Call a flag that does not exist and confirm enabled is false.
- Send the same user twice and confirm the boolean matches.
- **Dependencies:** DATA-01, APIKEY-01, EVAL-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:** 0
- **Bugs Fixed:** 0
- **UI Issues Fixed:** 0
- **Files Changed:** none
- **Notes:** Live checks on 127.0.0.1:3012. No token, a short token, and a session cookie used as a bearer are 401. An empty flag and a flag of spaces are 400. A 201-character flag and a 201-character user id are 400. An unknown flag is {enabled:false}. The same user returns the same boolean, and the body has only that field.

### EVAL-03 GET /api/v1/flags

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/app/api/v1/flags/route.ts
- **Expected behavior:** A valid API key can list flag definitions for a caller that wants to cache them. The SDK does not evaluate locally. The list does not include password hashes or API key secrets.
- **Acceptance:**
- [ ] A valid key receives the flag keys and rollout fields.
- [ ] No token is rejected.
- [ ] The payload contains no keyHash and no passwordHash.
- **Test cases:**
- List flags after creating one, then again with a revoked key.
- Confirm the response has no secret fields.
- **Dependencies:** EVAL-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### EVAL-04 Evaluate responses are not cached by a CDN

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/lib/security.test.ts, src/lib/http.ts
- **Expected behavior:** Flag checks are private and uncached. The response tells a shared cache not to store them, so a toggle is visible on the next check.
- **Acceptance:**
- [ ] The evaluate response includes Cache-Control private, no-store.
- [ ] A second check after a toggle sees the new value when the SDK cache is off.
- **Test cases:**
- Read the header on a live evaluate response during step 2.
- The existing security test covers the header.
- **Dependencies:** EVAL-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUTH-01 First admin setup

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/auth/setup/route.ts, src/app/setup/page.tsx, src/lib/auth.ts
- **Expected behavior:** POST /api/auth/setup creates the first admin and sets a session cookie. Email is trimmed and lowercased. Password must be 8 to 200 characters. Name must be 1 to 80 characters. After an account exists, setup no longer creates another one.
- **Acceptance:**
- [ ] The first valid body returns 201 and a session cookie.
- [ ] A second setup does not create another admin.
- [ ] A short password, a bad email, and invalid JSON are 400.
- [ ] The setup screen is not the way to add later users.
- **Test cases:**
- Post a valid admin, then post again.
- Post an empty body, a password of 7 characters, an emoji-only name, and a non-object JSON body.
- Two parallel setup requests must not both succeed.
- **Dependencies:** DATA-01, AUTH_SECRET of at least 16 characters.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUTH-02 Email and password session

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/auth/login/route.ts, src/app/api/auth/me/route.ts, src/lib/cookies.ts
- **Expected behavior:** Login checks the password with scrypt and sets an httpOnly session cookie. GET /api/auth/me returns the signed-in user. A wrong password and an unknown email fail without creating a session.
- **Acceptance:**
- [ ] A correct password sets the cookie and /api/auth/me returns that user.
- [ ] A wrong password does not set a session.
- [ ] The cookie is httpOnly.
- [ ] An expired session is treated as logged out.
- **Test cases:**
- Log in, call /api/auth/me, and open /flags.
- Log in with the wrong password, an empty password, and a non-English email that was not registered.
- Confirm the cookie flags from the Set-Cookie header.
- **Dependencies:** AUTH-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUTH-03 Sign out

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/auth/logout/route.ts
- **Expected behavior:** POST /api/auth/logout clears the session. After that, dashboard routes and /api/auth/me no longer accept the old cookie.
- **Acceptance:**
- [ ] Sign out redirects or returns success and the cookie is cleared.
- [ ] The old cookie cannot open /flags or /api/flags.
- **Test cases:**
- Sign in, sign out, then request /flags and /api/auth/me with the old cookie.
- Submit logout twice.
- **Dependencies:** AUTH-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUTH-04 Admin and member roles

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/lib/actors.ts, src/app/api/api-keys/route.ts, src/app/api/users/route.ts
- **Expected behavior:** A member can use flags. Creating and listing API keys, creating users, and deleting users require an admin. A member receives a forbidden response on those routes.
- **Acceptance:**
- [ ] A member can open flags.
- [ ] A member cannot create an API key or a teammate.
- [ ] An admin can do both.
- **Test cases:**
- Sign in as a member and request the key and team routes.
- Repeat as the admin.
- Call those routes with no session.
- **Dependencies:** TEAM-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUTH-05 Login failure limit

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/lib/rate-limit.ts, src/lib/rate-limit.test.ts
- **Expected behavior:** Eight failed sign-ins for the same email and client address are blocked for 15 minutes. The address comes from the first X-Forwarded-For value, trimmed to 80 characters, or unknown. The limit is in process memory.
- **Acceptance:**
- [ ] The eighth failure blocks the next attempt inside the window.
- [ ] A success is not what this counter records. Failures are.
- [ ] A different email is counted separately.
- **Test cases:**
- Run the rate-limit unit test.
- Send eight bad passwords and confirm the next attempt is blocked.
- Confirm a different address is not blocked by that bucket.
- **Dependencies:** AUTH-02. The counter resets when the process restarts.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUTH-06 Login error does not reveal which part failed

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/app/api/auth/login/route.ts, src/lib/api.test.ts
- **Expected behavior:** An unknown email and a wrong password return the same error. The response does not say which of the two was wrong.
- **Acceptance:**
- [ ] Both cases return the same status and the same message.
- [ ] The body does not contain the stored password hash.
- **Test cases:**
- Compare the two responses.
- The existing API test covers the timing and the message.
- **Dependencies:** AUTH-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### APIKEY-01 Create and list API keys

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/lib/secrets.ts, src/lib/api-keys.ts, src/app/api/api-keys/route.ts, src/app/(app)/settings/keys/page.tsx
- **Expected behavior:** An admin creates a key named by the operator. The secret is pn_ plus a random token and is returned once. Later lists show the prefix and name, not the secret. The database stores a hash that includes AUTH_SECRET.
- **Acceptance:**
- [ ] Create returns the pn_ secret once.
- [ ] A following list does not contain that secret.
- [ ] A member and a logged-out caller cannot create a key.
- [ ] Rotating AUTH_SECRET invalidates existing keys, as the README says.
- **Test cases:**
- Create a key, copy the secret, reload the list, and search the list for the secret.
- Create with an empty name and a very long name.
- Create as a member.
- **Dependencies:** AUTH-04.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### APIKEY-02 Revoke an API key

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/api-keys/[id]/route.ts
- **Expected behavior:** An admin can revoke a key. After that, GET /api/v1/evaluate with the secret is unauthorized. Revoking an unknown id does not succeed as if it existed.
- **Acceptance:**
- [ ] Evaluate works before revoke and returns 401 after.
- [ ] A member cannot revoke a key.
- [ ] Revoking the same key twice is a safe error.
- **Test cases:**
- Create a key, evaluate, revoke, evaluate again.
- Revoke with a member session and with no session.
- **Dependencies:** APIKEY-01, EVAL-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### FLAG-01 Create, read, and delete a flag

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/flags/route.ts, src/app/api/flags/[key]/route.ts, src/lib/flags.ts
- **Expected behavior:** A signed-in user can create a flag with a key, name, and description. The key matches a lowercase slug of at most 64 characters. Description is at most 500 characters. A duplicate key is rejected. Delete removes the flag and its targets.
- **Acceptance:**
- [ ] Create, fetch, and delete a flag.
- [ ] A duplicate key is rejected.
- [ ] A logged-out caller cannot create a flag.
- [ ] A description of 501 characters is rejected.
- **Test cases:**
- Create new-checkout, fetch it, and delete it.
- Create with an empty key, New-Checkout, a key with a slash, and a 500-character description.
- Create the same key twice.
- **Dependencies:** AUTH-02, FLAG-05.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### FLAG-02 Toggle and rollout percent

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/flags/[key]/route.ts, src/components/flag-editor.tsx, src/lib/validate.ts
- **Expected behavior:** PATCH sets enabled to a boolean and rolloutPercent to an integer from 0 through 100. Other types are rejected. The dashboard editor writes those fields.
- **Acceptance:**
- [ ] 0, 100, and a middle percent are stored.
- [ ] 101, -1, 1.5, and a string percent are rejected.
- [ ] enabled must be a boolean.
- **Test cases:**
- Patch a flag through the API and through the editor.
- Submit the form twice.
- Patch a flag that does not exist.
- **Dependencies:** FLAG-01, EVAL-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### FLAG-03 Per-user force on and force off

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/flags/[key]/targets/route.ts
- **Expected behavior:** POST sets a target for an external user id of 1 to 200 characters. allowed true forces on. allowed false forces off. The pair is unique. DELETE removes that target. A target wins over the percent.
- **Acceptance:**
- [ ] Force on stays on while the flag is off.
- [ ] Force off stays off at 100 percent.
- [ ] Deleting the target returns the user to the percent rule.
- [ ] An empty user id is rejected.
- **Test cases:**
- Create both kinds of target and evaluate each user.
- Post the same user twice.
- Delete a target that is not there.
- Use a 201-character id and an id with emoji.
- **Dependencies:** FLAG-01, EVAL-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### FLAG-04 Preview a user against a flag

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/app/api/flags/[key]/preview/route.ts
- **Expected behavior:** A signed-in user can preview whether one external id would be on for a flag, without minting an API key. The preview uses the same decision as evaluate.
- **Acceptance:**
- [ ] Preview matches GET /api/v1/evaluate for the same flag and user.
- [ ] A logged-out caller cannot preview.
- [ ] An unknown flag is a not-found or an off result, and the response does not throw a stack.
- **Test cases:**
- Preview a forced user, a rolled-out user, and a user id of spaces.
- Call preview with no session.
- **Dependencies:** FLAG-03, EVAL-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### FLAG-05 Flag key shape

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/lib/validate.ts, src/lib/validate.test.ts
- **Expected behavior:** A flag key must start with a letter and then use only lowercase letters, numbers, and hyphens, with a total length of 1 to 64. Uppercase, spaces, and slashes are rejected.
- **Acceptance:**
- [ ] new-checkout is accepted.
- [ ] New, a space, a slash, and a 65-character key are rejected.
- **Test cases:**
- Run the validate unit tests.
- Submit the new-flag form with each rejected shape.
- **Dependencies:** FLAG-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUDIT-01 Audit row on a flag change

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/lib/audit.ts, src/prisma/contract.prisma
- **Expected behavior:** Creating, updating, deleting a flag, and changing a target write an audit event with the actor email, action, flag key, and before and after JSON. The event does not store an API key secret or a password hash.
- **Acceptance:**
- [ ] A flag update appears in the audit list.
- [ ] The actor email matches the signed-in user.
- [ ] The stored JSON has no secret.
- **Test cases:**
- Change a flag and read the newest audit row.
- Delete a target and confirm that change is recorded too.
- **Dependencies:** FLAG-01, FLAG-03.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUDIT-02 List and filter the audit log

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/app/api/audit/route.ts, src/app/(app)/audit/page.tsx
- **Expected behavior:** A signed-in user can list audit events. Filters narrow by flag key. A logged-out caller cannot read the log.
- **Acceptance:**
- [ ] The list returns the events from AUDIT-01.
- [ ] A filter for one flag hides the others.
- [ ] No session is rejected.
- **Test cases:**
- List with no filter, with a known key, and with a key that has no events.
- Request the route with no cookie.
- **Dependencies:** AUDIT-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### AUDIT-03 Readable audit summaries

- **Status:** NOT STARTED
- **Priority:** P2
- **Files:** src/lib/audit-summary.ts, src/lib/audit-summary.test.ts
- **Expected behavior:** The dashboard shows a sentence for each audit action instead of only the raw JSON. The summary does not include secrets.
- **Acceptance:**
- [ ] A known action renders a sentence that names the flag.
- [ ] An unknown action does not throw.
- **Test cases:**
- Run the audit-summary unit tests.
- Open the audit page and read one line.
- **Dependencies:** AUDIT-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### TEAM-01 Admin adds a teammate

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/users/route.ts, src/app/(app)/settings/team/page.tsx
- **Expected behavior:** An admin creates a user with email, name, password, and role admin or member. The default role is member. Pennant does not send email. The password is stored as scrypt, not plaintext.
- **Acceptance:**
- [ ] An admin can add a member who can then sign in.
- [ ] A member cannot add a user.
- [ ] A duplicate email is rejected.
- [ ] The response and the database row do not contain the plaintext password.
- **Test cases:**
- Create a member, sign in as that member, and sign back in as the admin.
- Create with a short password and an invalid email.
- Create the same email twice.
- **Dependencies:** AUTH-04.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### TEAM-02 Admin removes a member

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/users/[id]/route.ts
- **Expected behavior:** An admin can delete a member. That user's sessions are removed with the user, so the old cookie stops working. A member cannot delete a user.
- **Acceptance:**
- [ ] After deletion, the member's cookie cannot open the dashboard.
- [ ] A member cannot call the delete route.
- **Test cases:**
- Delete a member while that member has a session, then reuse the cookie.
- Delete an unknown id.
- **Dependencies:** TEAM-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### TEAM-03 The last admin cannot be deleted

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/users/[id]/route.ts, src/lib/api.test.ts
- **Expected behavior:** Deleting the only remaining admin is rejected, including when two deletes race. The deployment is never left with zero admins.
- **Acceptance:**
- [ ] A sole admin cannot be deleted.
- [ ] Two parallel deletes of the last two admins leave one admin.
- **Test cases:**
- Attempt to delete the only admin.
- Run the concurrent last-admin test in the API suite.
- **Dependencies:** TEAM-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-01 Flags list and empty state

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/(app)/flags/page.tsx
- **Expected behavior:** A signed-in user sees the flags or a clear empty state. A logged-out visit does not show the list.
- **Acceptance:**
- [ ] An empty account shows the empty state.
- [ ] After one flag exists, the list shows its key and name.
- [ ] The list has no horizontal overflow at 360, 768, 1024, and 1440.
- **Test cases:**
- Open /flags signed out, then signed in with no flags, then with one flag.
- Check the console for errors.
- **UI checks:**
- Empty, one flag, and many flags.
- Light paper theme at the four widths.
- Keyboard to the new-flag link.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** FLAG-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-02 Flag detail editor

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/(app)/flags/[key]/page.tsx, src/components/flag-editor.tsx
- **Expected behavior:** The detail page toggles the flag, sets the percent, and adds or removes a target. The control shows the saved value after refresh.
- **Acceptance:**
- [ ] A toggle survives refresh.
- [ ] A percent outside 0 through 100 is not saved.
- [ ] The unknown-flag URL uses the not-found page.
- **Test cases:**
- Toggle, set 0 and 100, add a target, refresh, and go back.
- Open a missing key.
- Double-submit the save.
- **UI checks:**
- Disabled, loading, and saved states.
- Focus on the toggle and the percent field.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** FLAG-02, FLAG-03.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-03 New flag form

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/(app)/flags/new/page.tsx
- **Expected behavior:** The form creates a flag and opens it. Invalid keys stay on the form with an error and do not create a row.
- **Acceptance:**
- [ ] new-checkout is created.
- [ ] An uppercase key shows the validation error.
- [ ] Submitting twice does not create two flags.
- **Test cases:**
- Submit a valid key, an empty key, and a key with a space.
- Use the keyboard only.
- **UI checks:**
- Error under the field.
- The submit button is disabled while the request is in flight if the form does that.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** FLAG-05.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-04 Setup and login screens

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/setup/page.tsx, src/app/login/page.tsx, src/components/auth-forms.tsx
- **Expected behavior:** Before any user, /setup creates the admin. After that, operators use /login. Both forms show a safe error and do not echo the password.
- **Acceptance:**
- [ ] Setup closes once an account exists.
- [ ] A wrong password stays on the login page.
- [ ] The password field is type password.
- **Test cases:**
- Create the admin, return to /setup, then fail a login and succeed.
- Check 360 and 1440 widths.
- **UI checks:**
- Labels on both fields.
- Error text is visible and not only a color.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** AUTH-01, AUTH-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-05 API keys and team settings

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/(app)/settings/keys/page.tsx, src/app/(app)/settings/team/page.tsx, src/components/settings-forms.tsx
- **Expected behavior:** An admin sees both settings pages. A member does not get the create actions. A newly created key secret is visible once on the page.
- **Acceptance:**
- [ ] The secret is shown once and is not in the list after refresh.
- [ ] A member is blocked from the admin actions.
- [ ] The secret is not placed in the address bar.
- **Test cases:**
- Create a key, refresh, and confirm the secret is gone.
- Open both pages as a member.
- **UI checks:**
- The one-time secret is selectable.
- The revoke control has an accessible name.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** APIKEY-01, TEAM-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-06 Audit page

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/app/(app)/audit/page.tsx
- **Expected behavior:** The page lists the human-readable lines for flag changes. An empty log has an empty state. A logged-out user cannot see it.
- **Acceptance:**
- [ ] A flag edit appears as a sentence.
- [ ] The page does not show a password or an API secret.
- **Test cases:**
- Change a flag, open /audit, and filter if a filter is on the page.
- Open /audit signed out.
- **UI checks:**
- A long flag key does not overflow the row.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** AUDIT-03.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-07 Public home page

- **Status:** NOT STARTED
- **Priority:** P2
- **Files:** src/app/page.tsx
- **Expected behavior:** The home page explains the product, links to sign in, and links to the Vercel deploy button. The code sample uses the SDK and does not contain a real key.
- **Acceptance:**
- [ ] The heading and the sign-in link render.
- [ ] The sample has no live secret.
- [ ] The page is readable at 360 pixels.
- **Test cases:**
- Open / signed out.
- Follow Sign in and confirm it lands on /login.
- **UI checks:**
- Light paper theme.
- The deploy link is a real anchor.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** None.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-08 Signed-in shell

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/components/shell.tsx, src/app/(app)/layout.tsx
- **Expected behavior:** The signed-in shell links to flags, audit, and the settings an admin can use. Sign out is available. A logged-out request does not render the shell's private data.
- **Acceptance:**
- [ ] Each nav link opens the right page.
- [ ] Sign out returns to the public side.
- [ ] The nav fits at 360 pixels.
- **Test cases:**
- Click every nav item and sign out.
- Reload a private page and use the back button.
- **UI checks:**
- Current page is indicated.
- Focus stays visible on the links.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** AUTH-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-09 Not found and error pages

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/app/not-found.tsx, src/app/error.tsx
- **Expected behavior:** An unknown page says Page not found and links back to flags. A render error says Something went wrong, offers Try again, and does not print the exception or a secret.
- **Acceptance:**
- [ ] A missing URL shows Page not found.
- [ ] A thrown error does not include the exception text.
- [ ] Try again calls reset.
- **Test cases:**
- Open a missing URL.
- Throw from a temporary page, confirm the safe copy, and delete that page before the commit.
- **UI checks:**
- Both pages use the same paper type as the rest of the app.
- Also check light paper theme, 360, 768, 1024, and 1440, focus, and the browser console.
- **Dependencies:** None.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### UI-10 Crawl policy

- **Status:** NOT STARTED
- **Priority:** P2
- **Files:** src/app/robots.ts, src/app/layout.tsx
- **Expected behavior:** robots.txt disallows every path. The document metadata also sets robots to noindex, nofollow. The private dashboard is not an indexed site.
- **Acceptance:**
- [ ] GET /robots.txt disallows /.
- [ ] The home document carries noindex.
- **Test cases:**
- Fetch /robots.txt.
- Read the robots meta on /.
- **Dependencies:** SEO-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### SEO-01 Document title, description, and icon

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** src/app/layout.tsx, public/favicon.svg, public/logo.svg
- **Expected behavior:** The default title is Pennant and the template is the page name plus Pennant. The description is the self-hosted flag sentence. The icon is /favicon.svg.
- **Acceptance:**
- [ ] The home title is Pennant.
- [ ] A private page uses the template.
- [ ] The favicon request succeeds.
- **Test cases:**
- Read the title on /, /login, and /flags.
- Request /favicon.svg.
- **Dependencies:** None.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### SDK-01 Server SDK package

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** packages/sdk/package.json, packages/sdk/tsconfig.json, .github/workflows/ci.yml
- **Expected behavior:** The workspace package @rejisterjack/pennant is version 0.1.1, ESM, and built with tsc. CI builds it with npm run build -w @rejisterjack/pennant. It is server-side only.
- **Acceptance:**
- [ ] The package typechecks and builds.
- [ ] The published files are dist only.
- **Test cases:**
- Run the workspace build.
- Do not publish a tag in step 1.
- **Dependencies:** None.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### SDK-02 isEnabled calls evaluate

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** packages/sdk/src/index.ts, packages/sdk/src/index.test.ts
- **Expected behavior:** isEnabled sends GET /api/v1/evaluate with the bearer key and the flag query. A user id is added when present. An empty flag key throws. A missing flag from the API returns false. A non-OK response throws unless defaultValue is set.
- **Acceptance:**
- [ ] A true response returns true.
- [ ] A missing flag response of enabled false returns false.
- [ ] A 401 throws.
- [ ] The Authorization header is Bearer plus the key.
- **Test cases:**
- Run the SDK unit tests.
- Point a client at the local app during step 2 and check one flag.
- **Dependencies:** EVAL-02, SDK-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### SDK-03 Cache and default value

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** packages/sdk/src/index.ts
- **Expected behavior:** cacheTtlMs defaults to 0, so every check hits the API. A positive value reuses the boolean until it expires, with at most 1000 entries. defaultValue is returned only when the request fails. A missing flag is still false.
- **Acceptance:**
- [ ] The default client does not serve a stale toggle.
- [ ] A network failure returns defaultValue when one was passed.
- [ ] A network failure throws when defaultValue was not passed.
- **Test cases:**
- Run the SDK tests that cover the cache and the failure path.
- Call twice inside the TTL and confirm the second does not need a new response.
- **Dependencies:** SDK-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### SEC-01 Security headers

- **Status:** NOT STARTED
- **Priority:** P1
- **Files:** next.config.ts, src/lib/security.test.ts
- **Expected behavior:** Every path sends X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, a closed Permissions-Policy, and X-DNS-Prefetch-Control off.
- **Acceptance:**
- [ ] A document response and an API response carry those headers.
- [ ] The API does not reflect a script from a flag name into HTML.
- **Test cases:**
- Read the headers on / and on /api/health.
- Run the security unit test.
- **Dependencies:** None.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### SEC-02 Health check

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/app/api/health/route.ts, src/lib/health-down.test.ts
- **Expected behavior:** GET /api/health runs SELECT 1. It returns ok true when the database answers and ok false with status 503 when it does not. The failure is logged on the server and the response does not include the exception text.
- **Acceptance:**
- [ ] A healthy database returns 200 and ok true.
- [ ] An unreachable database returns 503 and ok false.
- [ ] The 503 body has no stack trace.
- **Test cases:**
- Call /api/health against the test database.
- Point a process at a closed port and call it again.
- Confirm POST /api/health is not a successful check.
- **Dependencies:** DATA-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### SEC-03 Concurrent evaluate load

- **Status:** NOT STARTED
- **Priority:** P2
- **Files:** src/lib/load.test.ts
- **Expected behavior:** The load test sends 200 concurrent evaluate checks. They complete without a crash and without mixing one user's result into another.
- **Acceptance:**
- [ ] 200 checks finish.
- [ ] A forced-on user stays on and a forced-off user stays off under concurrency.
- **Test cases:**
- Run the load test once. Do not weaken it if it fails.
- **Dependencies:** EVAL-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### HTTP-01 Session required on dashboard APIs

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** src/lib/actors.ts, src/app/api/flags/route.ts, src/lib/api.test.ts
- **Expected behavior:** Flag, audit, and team routes require a session. Evaluate and the public flag list require an API key. Health is open. A session cookie is not an API key, and an API key is not a dashboard session.
- **Acceptance:**
- [ ] No cookie gets 401 on /api/flags.
- [ ] An API key cannot open the dashboard flag route.
- [ ] A session cannot call /api/v1/evaluate.
- **Test cases:**
- Cross the two credentials on each route.
- Call /api/health with no credentials.
- **Dependencies:** AUTH-02, APIKEY-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### DEVOPS-01 GitHub Actions CI

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** .github/workflows/ci.yml
- **Expected behavior:** On a pull request and on a push to main, CI uses Postgres 16, runs prisma db migrate, typecheck, lint, npm test, the SDK build, the Next build, and Playwright. The CI auth secret is a fixture, not a production secret.
- **Acceptance:**
- [ ] The workflow file contains those steps in that order.
- [ ] Step 2 runs the same commands locally where they do not need a browser vendor install beyond what the repo already uses.
- **Test cases:**
- Read the workflow.
- Run typecheck, lint, and npm test against a local test database in step 2.
- **Dependencies:** DATA-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### DEVOPS-02 Vercel and Neon deploy shape

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** vercel.json, README.md
- **Expected behavior:** One deployment is one environment. The build migrates with DIRECT_URL and serves with DATABASE_URL. AUTH_SECRET must be at least 16 characters. The reference site is https://pennant.rejisterjack.com and the README says it is private.
- **Acceptance:**
- [ ] vercel.json matches the README build command.
- [ ] Step 2 does not print a production secret.
- [ ] The reference host is checked only as a public page, not with a guessed password.
- **Test cases:**
- Read the config.
- In step 2, request the public home page and /api/health without signing in.
- **Dependencies:** DATA-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### DEVOPS-03 SDK publish workflow

- **Status:** NOT STARTED
- **Priority:** P2
- **Files:** .github/workflows/publish-sdk.yml, packages/sdk/package.json
- **Expected behavior:** A tag sdk-v* publishes the package only when the tag matches packages/sdk/package.json version, currently 0.1.1. The workflow uses NPM_TOKEN and does not run on this report.
- **Acceptance:**
- [ ] The tag check is in the workflow.
- [ ] Step 1 and step 2 do not push an sdk-v tag.
- **Test cases:**
- Read the workflow. Do not publish.
- **Dependencies:** SDK-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### TEST-01 Node test suite

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** package.json, src/lib/*.test.ts, packages/sdk/src/index.test.ts
- **Expected behavior:** npm test runs the listed files with tsx, one at a time. The files cover evaluate, audit summaries, the login limit, validation, security headers, health when the database is down, the API, load, and the SDK. This is not a Vitest suite.
- **Acceptance:**
- [ ] npm test exits 0.
- [ ] A missing database fails the tests that need it, rather than skipping them silently.
- **Test cases:**
- Run npm test once the test database URL is set.
- Do not delete a failing assertion.
- **Dependencies:** DATA-01.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### TEST-02 Playwright operator journeys

- **Status:** NOT STARTED
- **Priority:** P0
- **Files:** e2e/journeys.spec.ts, playwright.config.ts, e2e/reset.ts
- **Expected behavior:** The existing Playwright file is the operator journey: setup, flags, keys, team, and audit. Step 2 also walks that journey in Chrome DevTools. The spec is not replaced with a new harness.
- **Acceptance:**
- [ ] The journey creates a flag and sees it evaluate.
- [ ] A member is blocked from keys and team.
- [ ] Sign out blocks the private pages.
- **Test cases:**
- Read the spec, then perform those steps in Chrome DevTools.
- Run npm run test:e2e only as the repo's existing command, not as a new browser harness.
- **Dependencies:** UI-01 through UI-06.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

### TEST-03 Health-down script

- **Status:** NOT STARTED
- **Priority:** P2
- **Files:** scripts/health-down-check.ts, src/lib/health-down.test.ts
- **Expected behavior:** The script and the unit test check that a down database becomes a 503 health response without leaking the error.
- **Acceptance:**
- [ ] The unit test passes.
- [ ] The script exits 0 against a closed database port.
- **Test cases:**
- Run the unit test.
- Run the script only if its arguments are local and it does not touch the reference deployment.
- **Dependencies:** SEC-02.
- **Suspected bugs:** None recorded from the source read.
- **Bugs Found:**
- **Bugs Fixed:**
- **UI Issues Fixed:**
- **Files Changed:**
- **Notes:**

## Assumptions

- The product is this Next.js app plus packages/sdk. The hosted site in the README is a private reference, not a shared demo with a published password.
- An earlier SHIP_REPORT.md listed deferred gaps as feature rows and called the test runner Vitest. This report replaces it. npm test uses tsx.
- Step 2 browser work uses Chrome DevTools. The Playwright file stays the existing suite. No new browser harness is added.
- AUTH_SECRET of at least 16 characters is required before any session or key hash can be created. Step 1 did not generate one and did not read a real .env.
- Member access to flags, with keys and team reserved for admins, is the intended rule from the route handlers.

## Risks

- Rotating AUTH_SECRET signs everyone out and invalidates API keys, because both hashes include that secret.
- Percentage rollout needs a stable user id. A check with no user id is off below 100 percent.
- The login limit lives in process memory. A restart or another server instance clears it.
- Neon can sleep when idle. The README says the first check after idle can be slow. /api/health is the readiness signal.
- A member who can edit flags can also change a production rollout. That is the current role split, not a second admin gate.
- The SDK cache, when enabled, can serve a toggle until the TTL ends. The default TTL is 0.
