import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

  const [{ data: contratistaRow }, authRes] = await Promise.all([
    sb.from("cr_usuarios").select("nombre").eq("id", perfil.contratista_id).single(),
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${perfil.contratista_id}`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    }),
  ]);

  const authData = await authRes.json();

  return NextResponse.json({
    contratista: {
      nombre: contratistaRow?.nombre ?? "Contratista",
      email: authData.email ?? null,
    },
  });
}
