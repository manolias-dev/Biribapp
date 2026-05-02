import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const r = requireAuth();
  if (r) return r;
  const body = await req.json().catch(() => ({}));
  const scores = body.scores && typeof body.scores === "object" ? body.scores : {};
  const { data, error } = await supabase
    .from("rounds")
    .insert({ game_id: params.id, scores })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ round: data });
}
