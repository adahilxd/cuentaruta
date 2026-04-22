import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: perfil } = await sb.from("cr_usuarios").select("nombre, rol").eq("id", user.id).single();
  if (perfil?.rol !== "contratista") {
    return NextResponse.json({ error: "Solo contratistas pueden invitar" }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const { data: inv, error } = await sb
    .from("cr_invitaciones")
    .insert({ contratista_id: user.id, email: email.toLowerCase().trim() })
    .select("token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const link = `${process.env.NEXT_PUBLIC_APP_URL || "https://cuentaruta.com"}/unirse/${inv.token}`;
  const nombre = perfil?.nombre ?? "Tu contratista";

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "hola@cuentaruta.com",
        to: email,
        subject: "Te invitaron a CuentaRuta",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px">
            <img src="https://cuentaruta.com/logo.png" alt="CuentaRuta" style="height:40px;margin-bottom:24px" />
            <h2 style="margin:0 0 16px">¡Fuiste invitado!</h2>
            <p><strong>${nombre}</strong> te invita a unirte a CuentaRuta como conductor de su flota.</p>
            <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#FFD600;color:#080C18;font-weight:700;text-decoration:none;border-radius:10px">
              Aceptar invitación
            </a>
            <p style="color:#666;font-size:13px">Esta invitación expira en 7 días.<br/>Si no esperabas esto, ignora este mensaje.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Error enviando email:", emailErr);
    }
  }

  return NextResponse.json({ ok: true, token: inv.token, link });
}

export async function GET(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await sb
    .from("cr_invitaciones")
    .select("id, email, estado, created_at, expires_at")
    .eq("contratista_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invitaciones: data });
}
