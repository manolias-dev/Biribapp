import { cookies } from "next/headers";
import { clearCookieOpts } from "@/lib/auth";

export async function POST() {
  cookies().set(clearCookieOpts());
  return Response.json({ ok: true });
}
