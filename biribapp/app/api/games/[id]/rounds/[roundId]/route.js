import { supabase } from "@/lib/supabase";
import { isAuthed, unauthorized } from "@/lib/auth";

export async function DELETE(request, { params }) {
  if (!isAuthed()) return unauthorized();
  const { roundId } = params;
  const { error } = await supabase.from("rounds").delete().eq("id", roundId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
