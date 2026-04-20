import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DashboardShell } from "./_components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("cr_usuarios")
    .select("nombre, plan")
    .eq("id", user.id)
    .single();

  const nombre = perfil?.nombre ?? user.email?.split("@")[0] ?? "Usuario";
  const plan = perfil?.plan ?? "trial";

  return (
    <DashboardShell name={nombre} plan={plan} email={user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
