import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const r = requireAuth();
  if (r) return r;
  const body = await req.json().catch(() => ({}));
  const update = {};
  if (typeof body.name === "string") update.name = body.name.trim();
  if (Number.isFinite(body.target_score)) update.target_score = body.target_score;
  if (Array.isArray(body.teams)) update.teams = body.teams;
  if (body.finished_at === null || typeof body.finished_at === "string") {
    update.finished_at = body.finished_at;
  }
  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("games")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ game: data });
}

export async function DELETE(_req, { params }) {
  const r = requireAuth();
  if (r) return r;
  const { error } = await supabase.from("games").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
