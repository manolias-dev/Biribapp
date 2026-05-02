import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = requireAuth();
  if (r) return r;
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, member_ids, created_at")
    .order("created_at", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ teams: data });
}

export async function POST(req) {
  const r = requireAuth();
  if (r) return r;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return Response.json({ error: "Name required" }, { status: 400 });
  const member_ids = Array.isArray(body.member_ids) ? body.member_ids : [];
  const { data, error } = await supabase
    .from("teams")
    .insert({ name, member_ids })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ team: data });
}
