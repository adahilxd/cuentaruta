import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
  return NextResponse.json({
    email: data.email,
    estado: data.estado,
    expires_at: data.expires_at,
    contratista_nombre: nombre,
    contratista_id: data.contratista_id,
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

  const { nombre, telefono, placa } = await req.json();

  const { data: inv, error: invErr } = await sb
    .from("cr_invitaciones")
    .select("id, contratista_id, estado")
    .eq("token", token)
    .single();

  if (invErr || !inv) return NextResponse.json({ error: "Invitación inválida" }, { status: 400 });
  if (inv.estado !== "pendiente") return NextResponse.json({ error: "Invitación ya usada" }, { status: 400 });

  const [upsertResult, updateResult] = await Promise.all([
    sb.from("cr_usuarios").upsert({
      id: user.id,
      nombre,
      telefono,
      placa,
      rol: "conductor",
      contratista_id: inv.contratista_id,
    }),
    sb.from("cr_invitaciones").update({ estado: "aceptada" }).eq("id", inv.id),
  ]);

  if (upsertResult.error) return NextResponse.json({ error: upsertResult.error.message }, { status: 500 });

  // Notify contratista
  await sb.from("cr_notificaciones").insert({
    usuario_id: inv.contratista_id,
    tipo: "conductor_unido",
    titulo: "Nuevo conductor en tu flota",
    mensaje: `${nombre} aceptó tu invitación y se unió a tu flota.`,
    referencia_id: user.id,
    referencia_tipo: "conductor",
  });

  return NextResponse.json({ ok: true });
}
