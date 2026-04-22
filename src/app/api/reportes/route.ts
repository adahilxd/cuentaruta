import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formato = req.nextUrl.searchParams.get("formato") ?? "excel";

  // Get all conductors under this contratista
  const { data: conductores } = await sb
    .from("cr_usuarios")
    .select("id, nombre, placa")
    .eq("contratista_id", user.id)
    .eq("rol", "conductor");

  const conductorIds = (conductores ?? []).map(c => c.id);

  const [trayRes, viaRes] = await Promise.all([
    sb.from("cr_trayectos")
      .select("conductor_id, fecha, semana, origen, destino, km, valor, estado")
      .in("conductor_id", conductorIds)
      .order("fecha", { ascending: false }),
    sb.from("cr_viaticos")
      .select("conductor_id, fecha, semana, categoria, descripcion, monto, estado")
      .in("conductor_id", conductorIds)
      .order("fecha", { ascending: false }),
  ]);

  const condMap = Object.fromEntries((conductores ?? []).map(c => [c.id, `${c.nombre} (${c.placa})`]));
  const trayectos = (trayRes.data ?? []).map(t => ({ ...t, conductor: condMap[t.conductor_id] ?? t.conductor_id }));
  const viaticos = (viaRes.data ?? []).map(v => ({ ...v, conductor: condMap[v.conductor_id] ?? v.conductor_id }));

  if (formato === "pdf") {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Flota — CuentaRuta", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 14, 26);

    doc.setFontSize(13);
    doc.text("Trayectos", 14, 38);
    autoTable(doc, {
      startY: 42,
      head: [["Conductor", "Fecha", "Sem", "Origen", "Destino", "Km", "Valor", "Estado"]],
      body: trayectos.map(t => [t.conductor, t.fecha, t.semana, t.origen, t.destino, t.km, t.valor, t.estado]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [8, 12, 24] },
    });

    const afterTray = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
    doc.setFontSize(13);
    doc.text("Viáticos", 14, afterTray);
    autoTable(doc, {
      startY: afterTray + 4,
      head: [["Conductor", "Fecha", "Sem", "Categoría", "Descripción", "Monto", "Estado"]],
      body: viaticos.map(v => [v.conductor, v.fecha, v.semana, v.categoria, v.descripcion, v.monto, v.estado]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [8, 12, 24] },
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte_flota.pdf"`,
      },
    });
  }

  // Excel
  const { utils, write } = await import("xlsx");

  const wb = utils.book_new();

  const traySheet = utils.json_to_sheet(
    trayectos.map(t => ({
      Conductor: t.conductor,
      Fecha: t.fecha,
      Semana: t.semana,
      Origen: t.origen,
      Destino: t.destino,
      "Km": t.km,
      "Valor (COP)": t.valor,
      Estado: t.estado,
    }))
  );
  utils.book_append_sheet(wb, traySheet, "Trayectos");

  const viaSheet = utils.json_to_sheet(
    viaticos.map(v => ({
      Conductor: v.conductor,
      Fecha: v.fecha,
      Semana: v.semana,
      Categoría: v.categoria,
      Descripción: v.descripcion,
      "Monto (COP)": v.monto,
      Estado: v.estado,
    }))
  );
  utils.book_append_sheet(wb, viaSheet, "Viáticos");

  const xlsxBuffer = write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(xlsxBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reporte_flota.xlsx"`,
    },
  });
}
