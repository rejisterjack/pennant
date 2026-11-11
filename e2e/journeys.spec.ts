import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { resetDatabase } from "./reset";

test.beforeEach(async () => {
  await resetDatabase();
});

async function createAdmin(page: Page) {
  await page.goto("/setup");
  await page.getByLabel("Name").fill("Ada");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Password").fill("correct-horse");
  await page.getByRole("button", { name: "Create admin account" }).click();
  await expect(page.getByRole("heading", { name: "Flags" })).toBeVisible();
}

async function createFlag(page: Page, key: string, name: string) {
  await page.getByRole("link", { name: "New flag" }).click();
  const form = page.locator("form").filter({ has: page.getByLabel("Key") });
  await form.getByLabel("Key").fill(key);
  await form.getByLabel("Name").fill(name);
  await form.getByRole("button", { name: "Create flag" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

test("operator creates, rolls out, targets, and deletes a flag", async ({ page }) => {
  await createAdmin(page);
  await expect(page.getByText("No flags yet")).toBeVisible();
  await createFlag(page, "new-checkout", "New checkout");

  await page.getByRole("button", { name: "Turn on" }).click();
  await expect(page.getByRole("button", { name: "Turn off" })).toBeVisible();

  await page.getByRole("spinbutton").fill("40");
  await page.getByRole("button", { name: "Save percent" }).click();
  await expect(page.getByText("Rollout 100% → 40%")).toBeVisible();

  await page.getByRole("textbox", { name: "User id" }).first().fill("user-ada");
  await page.getByRole("button", { name: "Save target" }).click();
  await expect(page.getByText("user-ada forced on")).toBeVisible();

  await page.getByRole("textbox", { name: "User id" }).nth(1).fill("user-ada");
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.getByText("Enabled")).toBeVisible();
  await expect(page.getByText("Flag created")).toBeVisible();
  await expect(page.getByText("Turned on")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete flag" }).click();
  await expect(page.getByText("No flags yet")).toBeVisible();
});

test("an API key follows a forced user and stops working when revoked", async ({ page, request }) => {
  await createAdmin(page);
  await createFlag(page, "new-checkout", "New checkout");
  await page.getByRole("button", { name: "Turn on" }).click();
  await page.getByRole("spinbutton").fill("0");
  await page.getByRole("button", { name: "Save percent" }).click();
  await page.getByRole("textbox", { name: "User id" }).first().fill("user-ada");
  await page.getByRole("button", { name: "Save target" }).click();
  await expect(page.getByText("Forced on")).toBeVisible();

  await page.getByRole("link", { name: "API keys" }).click();
  await page.getByLabel("Key name").fill("sdk");
  await page.getByRole("button", { name: "Create key" }).click();
  const secret = (await page.locator("code").textContent())?.trim() ?? "";
  expect(secret.startsWith("pn_")).toBe(true);

  const allowed = await evaluate(request, secret, "user-ada");
  expect(allowed).toEqual({ enabled: true });
  const outside = await evaluate(request, secret, "someone-else");
  expect(outside).toEqual({ enabled: false });

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Revoke" }).click();
  await expect(page.getByText("Revoked")).toBeVisible();
  const rejected = await request.get("/api/v1/evaluate?flag=new-checkout&userId=user-ada", {
    headers: { authorization: `Bearer ${secret}` },
  });
  expect(rejected.status()).toBe(401);
});

test("a member can open flags but not keys or team management", async ({ page, browser }) => {
  await createAdmin(page);
  await page.getByRole("link", { name: "Team" }).click();
  await page.getByPlaceholder("Name").fill("Grace");
  await page.getByPlaceholder("Email").fill("grace@example.com");
  await page.getByPlaceholder("Password").fill("correct-horse");
  await page.getByRole("button", { name: "Add teammate" }).click();
  await expect(page.getByText("grace@example.com")).toBeVisible();

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await memberPage.goto("/login");
  await memberPage.getByLabel("Email").fill("grace@example.com");
  await memberPage.getByLabel("Password").fill("correct-horse");
  await memberPage.getByRole("button", { name: "Sign in" }).click();
  await expect(memberPage.getByRole("heading", { name: "Flags" })).toBeVisible();
  await memberPage.getByRole("link", { name: "API keys" }).click();
  await expect(memberPage.getByText("Only admins can manage API keys.")).toBeVisible();
  await memberPage.getByRole("link", { name: "Team" }).click();
  await expect(memberPage.getByText("Only admins can add or remove teammates.")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("grace@example.com")).toHaveCount(0);

  await memberPage.goto("/flags");
  await expect(memberPage.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await memberContext.close();
});

test("signing out returns every app page to the sign-in screen", async ({ page }) => {
  await createAdmin(page);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  for (const path of ["/flags", "/audit", "/settings/keys", "/settings/team", "/setup"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Create the first admin" })).toHaveCount(0);
});

function evaluate(request: APIRequestContext, secret: string, userId: string) {
  return request
    .get(`/api/v1/evaluate?flag=new-checkout&userId=${userId}`, {
      headers: { authorization: `Bearer ${secret}` },
    })
    .then(async (response) => {
      expect(response.status()).toBe(200);
      return response.json();
    });
}
