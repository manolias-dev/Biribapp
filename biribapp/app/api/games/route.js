import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = requireAuth();
  if (r) return r;
  const { data: games, error: gErr } = await supabase
    .from("games")
    .select("id, name, target_score, teams, created_at, finished_at")
    .order("created_at", { ascending: false });
  if (gErr) return Response.json({ error: gErr.message }, { status: 500 });

  // Pull rounds for all games in one shot
  const ids = games.map((g) => g.id);
  let roundsByGame = {};
  if (ids.length > 0) {
    const { data: rounds, error: rErr } = await supabase
      .from("rounds")
      .select("id, game_id, scores, edited_at, at")
      .in("game_id", ids)
      .order("at", { ascending: true });
    if (rErr) return Response.json({ error: rErr.message }, { status: 500 });
    for (const r of rounds) {
      if (!roundsByGame[r.game_id]) roundsByGame[r.game_id] = [];
      roundsByGame[r.game_id].push(r);
    }
  }

  const result = games.map((g) => ({ ...g, rounds: roundsByGame[g.id] || [] }));
  return Response.json({ games: result });
}

export async function POST(req) {
  const r = requireAuth();
  if (r) return r;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  if (!name) return Response.json({ error: "Name required" }, { status: 400 });
  const target_score = Number(body.target_score) || 3000;
  const teams = Array.isArray(body.teams) ? body.teams : [];
  const { data, error } = await supabase
    .from("games")
    .insert({ name, target_score, teams })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ game: { ...data, rounds: [] } });
}
