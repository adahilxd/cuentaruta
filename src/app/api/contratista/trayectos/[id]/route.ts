import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = await createClient();

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Verificar que el caller es contratista del conductor dueño de este trayecto
  const sbAdmin = getSupabaseAdmin();
  const { data: trayecto, error: fetchErr } = await sbAdmin
    .from("cr_trayectos")
    .select("id, conductor_id, estado, cr_usuarios!conductor_id(contratista_id)")
    .eq("id", id)
    .single();

  console.log("[contratista PATCH trayecto]", { id, userId: user.id, trayecto, fetchErr });

  if (fetchErr || !trayecto) {
    return NextResponse.json({ error: "Trayecto no encontrado" }, { status: 404 });
  }

  const contratistaId = (trayecto.cr_usuarios as unknown as { contratista_id: string } | null)?.contratista_id;
  if (contratistaId !== user.id) {
    return NextResponse.json({ error: "Sin permiso para modificar este trayecto" }, { status: 403 });
  }

  const body = await req.json();
  const { estado, motivo_rechazo } = body;

  const estadosValidos = ["en_revision", "aprobado", "rechazado", "pagado"];
  if (!estadosValidos.includes(estado)) {
    return NextResponse.json({ error: `Estado inválido: ${estado}` }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    estado,
    aprobado_por: user.id,
    aprobado_at: new Date().toISOString(),
  };
  if (motivo_rechazo) update.motivo_rechazo = motivo_rechazo;

  const { data: updated, error: updateErr } = await sbAdmin
    .from("cr_trayectos")
    .update(update)
    .eq("id", id)
    .select("id, estado");

  console.log("[contratista PATCH trayecto] update:", updateErr ?? "ok", "| filas:", updated?.length ?? 0);

  if (updateErr || !updated?.length) {
    return NextResponse.json({
      error: updateErr?.message ?? "0 filas actualizadas",
    }, { status: 500 });
  }

  // Notificar al conductor si fue rechazado
  if (estado === "rechazado" && motivo_rechazo) {
    await sbAdmin.from("cr_notificaciones").insert({
      usuario_id: trayecto.conductor_id,
      tipo: "trayecto_rechazado",
      titulo: "Trayecto rechazado",
      mensaje: `Tu trayecto fue rechazado. Motivo: ${motivo_rechazo}`,
      referencia_id: id,
      referencia_tipo: "trayecto",
    });
  }

  return NextResponse.json({ ok: true });
}
