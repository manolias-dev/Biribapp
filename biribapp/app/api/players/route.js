import { supabase } from "@/lib/supabase";
import { isAuthed, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!isAuthed()) return unauthorized();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ players: data });
}

export async function POST(request) {
  if (!isAuthed()) return unauthorized();
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return Response.json({ error: "Name required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("players")
    .insert({ name: name.trim() })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ player: data });
}
