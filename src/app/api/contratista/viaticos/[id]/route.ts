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

  const sbAdmin = getSupabaseAdmin();
  const { data: viatico, error: fetchErr } = await sbAdmin
    .from("cr_viaticos")
    .select("id, conductor_id, estado, cr_usuarios!conductor_id(contratista_id)")
    .eq("id", id)
    .single();

  console.log("[contratista PATCH viatico]", { id, userId: user.id, viatico, fetchErr });

  if (fetchErr || !viatico) {
    return NextResponse.json({ error: "Viático no encontrado" }, { status: 404 });
  }

  const contratistaId = (viatico.cr_usuarios as unknown as { contratista_id: string } | null)?.contratista_id;
  if (contratistaId !== user.id) {
    return NextResponse.json({ error: "Sin permiso para modificar este viático" }, { status: 403 });
  }

  const body = await req.json();
  const { estado, motivo_rechazo } = body;

  const estadosValidos = ["aprobado", "rechazado"];
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
    .from("cr_viaticos")
    .update(update)
    .eq("id", id)
    .select("id, estado");

  console.log("[contratista PATCH viatico] update:", updateErr ?? "ok", "| filas:", updated?.length ?? 0);

  if (updateErr || !updated?.length) {
    return NextResponse.json({
      error: updateErr?.message ?? "0 filas actualizadas",
    }, { status: 500 });
  }

  if (estado === "rechazado" && motivo_rechazo) {
    await sbAdmin.from("cr_notificaciones").insert({
      usuario_id: viatico.conductor_id,
      tipo: "viatico_rechazado",
      titulo: "Viático rechazado",
      mensaje: `Tu viático fue rechazado. Motivo: ${motivo_rechazo}`,
      referencia_id: id,
      referencia_tipo: "viatico",
    });
  }

  return NextResponse.json({ ok: true });
}
