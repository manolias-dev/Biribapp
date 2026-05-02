import { cookies } from "next/headers";

const PASSCODE = process.env.APP_PASSCODE;
const COOKIE_NAME = "biribapp_auth";

if (!PASSCODE) {
  console.warn("APP_PASSCODE env var not set. Authentication is disabled.");
}

export function checkPasscode(input) {
  if (!PASSCODE) return false;
  return String(input).trim() === String(PASSCODE).trim();
}

export function isAuthed() {
  if (!PASSCODE) return true; // dev fallback
  const c = cookies().get(COOKIE_NAME);
  return c?.value === PASSCODE;
}

export function authCookieOpts() {
  return {
    name: COOKIE_NAME,
    value: PASSCODE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  };
}

export function clearCookieOpts() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
