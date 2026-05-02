import { supabase } from "@/lib/supabase";
import { isAuthed, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!isAuthed()) return unauthorized();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ teams: data });
}

export async function POST(request) {
  if (!isAuthed()) return unauthorized();
  const { name, member_ids } = await request.json();
  if (!name || !name.trim()) {
    return Response.json({ error: "Name required" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("teams")
    .insert({ name: name.trim(), member_ids: member_ids || [] })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ team: data });
}
