import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: perfil } = await sb
    .from("cr_usuarios")
    .select("contratista_id")
    .eq("id", user.id)
    .single();

  if (!perfil?.contratista_id) return NextResponse.json({ contratista: null });

  const [{ data: contratistaRow }, { data: authData }] = await Promise.all([
    sb.from("cr_usuarios").select("nombre").eq("id", perfil.contratista_id).single(),
    supabaseAdmin.auth.admin.getUserById(perfil.contratista_id),
  ]);

  return NextResponse.json({
    contratista: {
      nombre: contratistaRow?.nombre ?? "Contratista",
      email: authData.user?.email ?? null,
    },
  });
}
