import { supabase } from "@/lib/supabase";
import { isAuthed, unauthorized } from "@/lib/auth";

export async function DELETE(request, { params }) {
  if (!isAuthed()) return unauthorized();
  const { id } = params;

  // Remove from any teams that reference this player
  const { data: teams } = await supabase.from("teams").select("*");
  if (teams) {
    for (const t of teams) {
      if (t.member_ids && t.member_ids.includes(id)) {
        await supabase
          .from("teams")
          .update({ member_ids: t.member_ids.filter((m) => m !== id) })
          .eq("id", t.id);
      }
    }
  }

  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
