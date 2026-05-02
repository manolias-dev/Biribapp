import { checkPasscode, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const { passcode } = await req.json().catch(() => ({}));
  if (!checkPasscode(passcode)) {
    return Response.json({ error: "Invalid passcode" }, { status: 401 });
  }
  setSessionCookie();
  return Response.json({ ok: true });
}
