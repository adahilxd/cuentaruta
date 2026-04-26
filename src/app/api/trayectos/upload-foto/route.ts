import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "trayectos";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const conductorId = form.get("conductorId") as string;
    const trayectoId = form.get("trayectoId") as string;
    const tipo = form.get("tipo") as "inicio" | "fin";

    if (!file || !conductorId || !trayectoId || !tipo) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Foto demasiado grande (máx 10 MB)" }, { status: 400 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const fileName = tipo === "inicio" ? "foto_inicio.jpg" : "foto_fin.jpg";
    const path = `${conductorId}/${trayectoId}/${fileName}`;
    const bytes = await file.arrayBuffer();

    const { error } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    // Cache-buster para que el preview muestre la foto nueva si se reemplazó
    const url = `${data.publicUrl}?t=${Date.now()}`;
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
