import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "trayectos";

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    // ── LOG 1: Variables de entorno ──────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log("[upload-foto] ENV check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
      keyPrefix: serviceKey?.slice(0, 12) ?? "UNDEFINED",
    });

    const form = await req.formData();
    const file        = form.get("file") as File | null;
    const conductorId = form.get("conductorId") as string;
    const trayectoId  = form.get("trayectoId") as string;
    const tipo        = form.get("tipo") as "inicio" | "fin";

    // ── LOG 2: FormData recibido ─────────────────────────────────────
    console.log("[upload-foto] FormData:", {
      hasFile: !!file,
      fileSize: file?.size ?? 0,
      fileType: file?.type ?? "none",
      conductorId: conductorId || "(VACÍO)",
      trayectoId:  trayectoId  || "(VACÍO)",
      tipo,
    });

    if (!file || !conductorId || !trayectoId || !tipo) {
      const missing = { file: !file, conductorId: !conductorId, trayectoId: !trayectoId, tipo: !tipo };
      console.error("[upload-foto] Faltan parámetros:", missing);
      return NextResponse.json({ error: "Faltan parámetros", missing }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error("[upload-foto] Archivo demasiado grande:", file.size);
      return NextResponse.json({ error: "Foto demasiado grande (máx 10 MB)" }, { status: 400 });
    }

    if (!supabaseUrl || !serviceKey) {
      console.error("[upload-foto] CRÍTICO: vars de entorno faltantes");
      return NextResponse.json({ error: "Configuración de servidor incompleta" }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const fileName = tipo === "inicio" ? "foto_inicio.jpg" : "foto_fin.jpg";
    const path = `${conductorId}/${trayectoId}/${fileName}`;
    const bytes = await file.arrayBuffer();

    // ── LOG 3: Intentando upload ─────────────────────────────────────
    console.log("[upload-foto] Subiendo a Storage:", { bucket: BUCKET, path, bytes: bytes.byteLength });

    const { data: uploadData, error } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });

    // ── LOG 4: Resultado de Storage ──────────────────────────────────
    console.log("[upload-foto] Storage result:", {
      ok: !error,
      fullPath: uploadData?.fullPath ?? null,
      error: error?.message ?? null,
      ms: Date.now() - t0,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    console.log("[upload-foto] URL pública:", url);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload-foto] EXCEPCIÓN:", String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
