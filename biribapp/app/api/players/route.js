import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = requireAuth();
  if (r) return r;
  const { data, error } = await supabase
    .from("players")
    .select("id, name, photo, palette_idx, created_at")
    .order("created_at", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ players: data });
}

export async function POST(req) {
  const r = requireAuth();
  if (r) return r;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return Response.json({ error: "Name required" }, { status: 400 });
  const photo = body.photo || null;
  const palette_idx = Number.isFinite(body.palette_idx) ? body.palette_idx : 0;
  const { data, error } = await supabase
    .from("players")
    .insert({ name, photo, palette_idx })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ player: data });
}
