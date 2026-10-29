import { HttpError } from "@/lib/http";

const FLAG_KEY = /^[a-z][a-z0-9-]{0,63}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmail(value: unknown): string {
  if (typeof value !== "string") throw new HttpError(400, "Email is required");
  const email = value.trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) throw new HttpError(400, "Enter a valid email");
  return email;
}

export function parsePassword(value: unknown): string {
  if (typeof value !== "string" || value.length < 8 || value.length > 200) {
    throw new HttpError(400, "Password must be 8 to 200 characters");
  }
  return value;
}

export function parseName(value: unknown): string {
  if (typeof value !== "string") throw new HttpError(400, "Name is required");
  const name = value.trim();
  if (name.length < 1 || name.length > 80) throw new HttpError(400, "Name must be 1 to 80 characters");
  return name;
}

export function parseFlagKey(value: unknown): string {
  if (typeof value !== "string" || !FLAG_KEY.test(value)) {
    throw new HttpError(
      400,
      "Flag key must start with a letter and use lowercase letters, numbers, and hyphens",
    );
  }
  return value;
}

export function parseDescription(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > 500) {
    throw new HttpError(400, "Description must be 500 characters or fewer");
  }
  return value;
}

export function parseRollout(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
    throw new HttpError(400, "Rollout percent must be an integer from 0 to 100");
  }
  return value;
}

export function parseEnabled(value: unknown): boolean {
  if (typeof value !== "boolean") throw new HttpError(400, "Enabled must be true or false");
  return value;
}

export function parseExternalId(value: unknown): string {
  if (typeof value !== "string") throw new HttpError(400, "User id is required");
  const id = value.trim();
  if (id.length < 1 || id.length > 200) {
    throw new HttpError(400, "User id must be 1 to 200 characters");
  }
  return id;
}

export function parseRole(value: unknown): "admin" | "member" {
  if (value === undefined || value === "member") return "member";
  if (value === "admin") return "admin";
  throw new HttpError(400, "Role must be admin or member");
}
