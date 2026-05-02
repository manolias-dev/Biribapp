import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const r = requireAuth();
  if (r) return r;
  const body = await req.json().catch(() => ({}));
  const update = {};
  if (body.scores && typeof body.scores === "object") update.scores = body.scores;
  update.edited_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("rounds")
    .update(update)
    .eq("id", params.roundId)
    .eq("game_id", params.id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ round: data });
}

export async function DELETE(_req, { params }) {
  const r = requireAuth();
  if (r) return r;
  const { error } = await supabase
    .from("rounds")
    .delete()
    .eq("id", params.roundId)
    .eq("game_id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
