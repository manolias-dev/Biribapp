import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const r = requireAuth();
  if (r) return r;
  const body = await req.json().catch(() => ({}));
  const update = {};
  if (typeof body.name === "string") update.name = body.name.trim();
  if (Array.isArray(body.member_ids)) update.member_ids = body.member_ids;
  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("teams")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ team: data });
}

export async function DELETE(_req, { params }) {
  const r = requireAuth();
  if (r) return r;
  const { error } = await supabase.from("teams").delete().eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
