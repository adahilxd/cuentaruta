import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Route, Navigation, Wallet, FileWarning, BarChart2, Calculator, LogOut } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nombre = user.user_metadata?.nombre ?? user.email?.split("@")[0] ?? "Usuario";
  const plan = user.user_metadata?.plan ?? "conductor";
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  const modulos = [
    { icon: Navigation, label: "Trayectos", desc: "Registra y gestiona tus rutas", color: "var(--accent-green)", dim: "var(--accent-green-dim)", href: "/dashboard/trayectos", ready: true },
    { icon: Wallet, label: "Viáticos", desc: "ACPM, peajes, alimentación y más", color: "var(--accent-yellow)", dim: "var(--accent-yellow-dim)", href: "/dashboard/viaticos", ready: false },
    { icon: FileWarning, label: "Documentos", desc: "SOAT, póliza, licencia y alertas", color: "var(--accent-red)", dim: "var(--accent-red-dim)", href: "/dashboard/documentos", ready: false },
    { icon: BarChart2, label: "Dashboard", desc: "KPIs y gráfica de ingresos", color: "var(--accent-blue)", dim: "var(--accent-blue-dim)", href: "/dashboard", ready: false },
    { icon: Calculator, label: "Liquidación", desc: "Calcula vacaciones y cesantías", color: "var(--accent-green)", dim: "var(--accent-green-dim)", href: "/dashboard/liquidacion", ready: false },
  ];

  return (
    <>
      <style>{`
        body { background: var(--bg-base); }
        .module-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 24px;
          text-decoration: none;
          display: block;
          transition: border-color 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .module-card:hover {
          border-color: var(--glass-border-hover);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Topbar */}
      <header style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(8,12,24,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Route size={16} color="var(--accent-yellow)" strokeWidth={1.5} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>CuentaRuta</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ background: plan === "contratista" ? "var(--accent-blue-dim)" : "var(--accent-green-dim)", border: `1px solid ${plan === "contratista" ? "rgba(68,136,255,0.2)" : "rgba(0,230,118,0.2)"}`, color: plan === "contratista" ? "var(--accent-blue)" : "var(--accent-green)", borderRadius: 100, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
              {plan}
            </span>
            <form action="/auth/signout" method="post">
              <Link
                href="/api/auth/signout"
                style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500, transition: "color 0.2s" }}
              >
                <LogOut size={16} strokeWidth={1.5} />
                Salir
              </Link>
            </form>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px 80px" }}>

        {/* Saludo */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 6 }}>{saludo} 👋</p>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            {nombre}
          </h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 100, padding: "6px 14px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 6px var(--accent-green)" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-green)" }}>
              Prueba gratuita activa — 14 días restantes
            </span>
          </div>
        </div>

        {/* KPI placeholder strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 48 }}
          className="kpi-grid">
          {[
            { label: "Trayectos", value: "—", sub: "esta semana", color: "var(--accent-green)" },
            { label: "Ingresos", value: "—", sub: "este mes", color: "var(--accent-yellow)" },
            { label: "Gastos", value: "—", sub: "este mes", color: "var(--accent-red)" },
            { label: "Documentos", value: "—", sub: "por vencer", color: "var(--accent-blue)" },
          ].map((k) => (
            <div key={k.label} style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: "20px" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</p>
              <p className="font-display tabular-nums" style={{ fontSize: "1.8rem", fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.value}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Módulos */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: 20, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Módulos
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {modulos.map((m) => (
              m.ready ? (
                <Link key={m.label} href={m.href} className="module-card">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: m.dim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <m.icon size={20} color={m.color} strokeWidth={1.5} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4, color: "var(--text-primary)" }}>{m.label}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.desc}</p>
                </Link>
              ) : (
                <div key={m.label} className="module-card">
                  <span style={{ position: "absolute", top: 12, right: 12, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 100, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-tertiary)" }}>
                    Próximamente
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: m.dim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <m.icon size={20} color={m.color} strokeWidth={1.5} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{m.label}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.desc}</p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* CTA primeros pasos */}
        <div style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontWeight: 700, fontSize: "1rem" }}>🚀 Estamos construyendo tu app</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Los módulos estarán disponibles pronto. Mientras tanto, si tienes dudas escríbenos por{" "}
            <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-green)", fontWeight: 600 }}>
              WhatsApp
            </a>.
          </p>
        </div>

      </main>

      <style>{`
        @media (min-width: 640px) {
          .kpi-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
