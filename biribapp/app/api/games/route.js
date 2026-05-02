import { supabase } from "@/lib/supabase";
import { isAuthed, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!isAuthed()) return unauthorized();
  const { data: games, error } = await supabase
    .from("games")
    .select("*, rounds(*)")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Sort rounds by round_number ascending
  const formatted = (games || []).map((g) => ({
    ...g,
    rounds: (g.rounds || []).sort((a, b) => a.round_number - b.round_number),
  }));
  return Response.json({ games: formatted });
}

export async function POST(request) {
  if (!isAuthed()) return unauthorized();
  const { name, target_score, teams } = await request.json();
  if (!name || !name.trim() || !Array.isArray(teams) || teams.length < 2) {
    return Response.json({ error: "Need name and at least 2 teams" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("games")
    .insert({
      name: name.trim(),
      target_score: Number(target_score) || 3000,
      teams,
    })
    .select("*, rounds(*)")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ game: { ...data, rounds: data.rounds || [] } });
}
