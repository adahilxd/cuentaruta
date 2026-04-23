import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserByEmail } from "@/lib/supabase-admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = await createClient();

  const { data, error } = await sb
    .from("cr_invitaciones")
    .select("id, email, estado, expires_at, contratista_id, cr_usuarios!contratista_id(nombre)")
    .eq("token", token)
    .single();

  if (error || !data) return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });

  const nombre = (data.cr_usuarios as unknown as { nombre: string } | null)?.nombre ?? "Tu contratista";

  const authUser = await getUserByEmail(data.email);
  const tieneaccount = !!authUser;

  return NextResponse.json({
    email: data.email,
    estado: data.estado,
    expires_at: data.expires_at,
    contratista_nombre: nombre,
    contratista_id: data.contratista_id,
    tieneaccount,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = await createClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { nombre, telefono, placa, existingUser } = await req.json();

  const { data: inv, error: invErr } = await sb
    .from("cr_invitaciones")
    .select("id, contratista_id, estado")
    .eq("token", token)
    .single();

  if (invErr || !inv) return NextResponse.json({ error: "Invitación inválida" }, { status: 400 });
  if (inv.estado !== "pendiente") return NextResponse.json({ error: "Invitación ya usada" }, { status: 400 });

  let nombreFinal = nombre;

  if (existingUser) {
    const { error: updateErr } = await sb
      .from("cr_usuarios")
      .update({ contratista_id: inv.contratista_id })
      .eq("id", user.id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    const { data: perfil } = await sb.from("cr_usuarios").select("nombre").eq("id", user.id).single();
    nombreFinal = perfil?.nombre ?? "Un conductor";
  } else {
    const { error: upsertErr } = await sb.from("cr_usuarios").upsert({
      id: user.id,
      nombre,
      telefono,
      placa,
      rol: "conductor",
      contratista_id: inv.contratista_id,
    });
    if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  await sb.from("cr_invitaciones").update({ estado: "aceptada" }).eq("id", inv.id);

  // Notify contratista
  await sb.from("cr_notificaciones").insert({
    usuario_id: inv.contratista_id,
    tipo: "conductor_unido",
    titulo: "Nuevo conductor en tu flota",
    mensaje: `${nombreFinal} aceptó tu invitación y se unió a tu flota.`,
    referencia_id: user.id,
    referencia_tipo: "conductor",
  });

  return NextResponse.json({ ok: true });
}
