import { cookies } from "next/headers";
import { checkPasscode, authCookieOpts } from "@/lib/auth";

export async function POST(request) {
  const { passcode } = await request.json();
  if (!checkPasscode(passcode)) {
    return Response.json({ error: "Wrong passcode" }, { status: 401 });
  }
  cookies().set(authCookieOpts());
  return Response.json({ ok: true });
}
