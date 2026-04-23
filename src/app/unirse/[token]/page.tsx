import { createClient } from "@/utils/supabase/server";
import { getUserByEmail } from "@/lib/supabase-admin";
import UnirseClient from "./UnirseClient";

function ErrorPage({ emoji = "😕", title = "Invitación no válida", message }: { emoji?: string; title?: string; message: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
        <h2 style={{ color: "#fff", fontFamily: "Sora, sans-serif", marginBottom: 8 }}>{title}</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif" }}>{message}</p>
      </div>
    </div>
  );
}

export default async function UnirsePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = await createClient();

  // 1. Obtener datos de la invitación
  const { data: inv, error } = await sb
    .from("cr_invitaciones")
    .select("id, email, estado, contratista_id, cr_usuarios!contratista_id(nombre)")
    .eq("token", token)
    .single();

  if (error || !inv) return <ErrorPage message="La invitación no existe o el enlace es inválido." />;
  if (inv.estado !== "pendiente") return <ErrorPage emoji="✅" title="Invitación ya usada" message="Esta invitación ya fue aceptada." />;

  const nombreContratista = (inv.cr_usuarios as unknown as { nombre: string } | null)?.nombre ?? "Tu contratista";

  // 2. Detectar si el email ya tiene cuenta en auth.users (server-side, sin tocar cr_usuarios)
  const authUser = await getUserByEmail(inv.email);
  const existeUsuario = !!authUser;

  // 3. Pasar resultado como props al componente cliente
  return (
    <UnirseClient
      token={token}
      existeUsuario={existeUsuario}
      emailInvitacion={inv.email}
      nombreContratista={nombreContratista}
    />
  );
}
