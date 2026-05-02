import { supabase } from "@/lib/supabase";
import { isAuthed, unauthorized } from "@/lib/auth";

export async function POST(request, { params }) {
  if (!isAuthed()) return unauthorized();
  const { id: gameId } = params;
  const { scores } = await request.json();
  if (!scores || typeof scores !== "object") {
    return Response.json({ error: "Scores required" }, { status: 400 });
  }

  // Determine next round_number
  const { data: existing } = await supabase
    .from("rounds")
    .select("round_number")
    .eq("game_id", gameId)
    .order("round_number", { ascending: false })
    .limit(1);
  const nextNumber = (existing?.[0]?.round_number || 0) + 1;

  const { data, error } = await supabase
    .from("rounds")
    .insert({ game_id: gameId, round_number: nextNumber, scores })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ round: data });
}
