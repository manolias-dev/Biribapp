import { supabase } from "@/lib/supabase";
import { isAuthed, unauthorized } from "@/lib/auth";

export async function PATCH(request, { params }) {
  if (!isAuthed()) return unauthorized();
  const { id } = params;
  const body = await request.json();
  const update = {};
  if ("finished_at" in body) update.finished_at = body.finished_at;
  if ("name" in body && body.name?.trim()) update.name = body.name.trim();
  if ("target_score" in body) update.target_score = Number(body.target_score);

  const { data, error } = await supabase
    .from("games")
    .update(update)
    .eq("id", id)
    .select("*, rounds(*)")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({
    game: {
      ...data,
      rounds: (data.rounds || []).sort((a, b) => a.round_number - b.round_number),
    },
  });
}

export async function DELETE(request, { params }) {
  if (!isAuthed()) return unauthorized();
  const { id } = params;
  // rounds cascade via FK
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
