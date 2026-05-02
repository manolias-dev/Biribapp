import { cookies } from "next/headers";

const COOKIE_NAME = "biriba_session";
const PASSCODE = process.env.APP_PASSCODE || "";

export function checkPasscode(input) {
  if (!PASSCODE) return false;
  return String(input).trim() === String(PASSCODE).trim();
}

export function setSessionCookie() {
  cookies().set(COOKIE_NAME, "ok", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export function isAuthed() {
  const c = cookies().get(COOKIE_NAME);
  return c?.value === "ok";
}

export function requireAuth() {
  if (!isAuthed()) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}
