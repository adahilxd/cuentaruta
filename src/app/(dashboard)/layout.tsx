"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Navigation, Wallet, CalendarDays,
  FileWarning, Calculator, Settings, Route,
  MoreHorizontal, X, LogOut, ChevronRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ── Nav ───────────────────────────────────────────────────────────────
const NAV = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/trayectos",    icon: Navigation,      label: "Trayectos"    },
  { href: "/viaticos",     icon: Wallet,          label: "Viáticos"     },
  { href: "/flujo",        icon: CalendarDays,    label: "Flujo Semanal"},
  { href: "/documentos",   icon: FileWarning,     label: "Documentos"   },
  { href: "/liquidacion",  icon: Calculator,      label: "Liquidación"  },
  { href: "/configuracion",icon: Settings,        label: "Configuración"},
];

const BOTTOM_NAV = [
  NAV[0], // Dashboard
  NAV[1], // Trayectos
  NAV[2], // Viáticos
  NAV[4], // Documentos
];

// ── Shell ─────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from("cr_usuarios").select("nombre").eq("id", user.id).single();
      setNombre(data?.nombre ?? user.email?.split("@")[0] ?? "Usuario");
    })();
  }, []);

  const initials = nombre
    .split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase() || "?";

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  const pageTitle = NAV.find((n) => isActive(n.href))?.label ?? "Dashboard";

  async function handleLogout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <style>{`
        /* ── Root ─────────────────────────────────────────── */
        .crs-root { display:flex; min-height:100vh; background:var(--bg-base); }

        /* ── Sidebar ──────────────────────────────────────── */
        .crs-sidebar {
          width:240px; flex-shrink:0; height:100vh; position:sticky; top:0;
          display:flex; flex-direction:column;
          background:var(--bg-surface);
          border-right:1px solid var(--glass-border);
          z-index:50; overflow-y:auto;
        }
        .crs-logo {
          display:flex; align-items:center; gap:10px;
          padding:20px 16px 16px;
          border-bottom:1px solid var(--glass-border);
          text-decoration:none;
        }
        .crs-logo-icon {
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          background:rgba(255,214,0,0.12);
          border:1px solid rgba(255,214,0,0.25);
          display:flex; align-items:center; justify-content:center;
        }
        .crs-logo-text {
          font-family:'Sora',sans-serif; font-weight:800; font-size:1rem;
          color:var(--text-primary); letter-spacing:-0.02em;
        }
        .crs-nav { flex:1; padding:12px 10px; display:flex; flex-direction:column; gap:2px; }
        .crs-link {
          display:flex; align-items:center; gap:10px;
          padding:9px 12px; border-radius:var(--radius-sm);
          text-decoration:none; font-size:0.875rem; font-weight:500;
          color:var(--text-secondary); font-family:'DM Sans',sans-serif;
          transition:all 0.15s; border-left:3px solid transparent;
        }
        .crs-link:hover { background:rgba(255,255,255,0.05); color:var(--text-primary); }
        .crs-link.active {
          background:rgba(0,230,118,0.12); color:#00E676;
          border-left-color:#00E676; font-weight:600;
        }
        .crs-footer {
          padding:12px 10px 16px;
          border-top:1px solid var(--glass-border);
        }
        .crs-user {
          display:flex; align-items:center; gap:10px; padding:10px 12px;
          border-radius:var(--radius-sm);
          background:var(--glass-bg); border:1px solid var(--glass-border);
          margin-bottom:8px;
        }
        .crs-avatar {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#FFD600,#00E676);
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:0.75rem; color:#080C18;
        }
        .crs-badge {
          display:inline-flex; align-items:center;
          padding:2px 8px; border-radius:100px;
          font-size:0.68rem; font-weight:700;
          background:rgba(0,230,118,0.12);
          border:1px solid rgba(0,230,118,0.2);
          color:#00E676;
        }
        .crs-logout {
          display:flex; align-items:center; gap:8px; width:100%;
          padding:8px 12px; border-radius:var(--radius-sm);
          background:none; border:1px solid var(--glass-border);
          color:var(--text-tertiary); font-size:0.82rem; font-weight:500;
          cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s;
        }
        .crs-logout:hover { color:var(--accent-red); border-color:rgba(255,68,68,0.3); background:rgba(255,68,68,0.08); }

        /* ── Main ─────────────────────────────────────────── */
        .crs-main { flex:1; min-width:0; display:flex; flex-direction:column; }

        /* ── Mobile header ────────────────────────────────── */
        .crs-mobile-header {
          display:none; height:56px; position:sticky; top:0; z-index:100;
          background:rgba(8,12,24,0.92); border-bottom:1px solid var(--glass-border);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          align-items:center; justify-content:space-between; padding:0 16px;
        }
        .crs-mobile-title {
          font-family:'Sora',sans-serif; font-weight:700; font-size:0.95rem;
          color:var(--text-primary); position:absolute; left:50%; transform:translateX(-50%);
          white-space:nowrap;
        }

        /* ── Bottom nav ───────────────────────────────────── */
        .crs-bottom-nav {
          display:none; position:fixed; bottom:0; left:0; right:0; height:62px;
          background:rgba(8,12,30,0.95); border-top:1px solid rgba(255,255,255,0.08);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          z-index:100; align-items:stretch;
        }
        .crs-tab {
          flex:1; display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:3px; text-decoration:none;
          color:var(--text-tertiary); font-size:0.62rem; font-weight:600;
          font-family:'DM Sans',sans-serif; border:none; background:none;
          cursor:pointer; padding:0; transition:color 0.15s;
        }
        .crs-tab.active { color:#00E676; }

        /* ── Drawer ───────────────────────────────────────── */
        .crs-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.65);
          backdrop-filter:blur(4px); z-index:200;
        }
        .crs-drawer {
          position:fixed; bottom:0; left:0; right:0;
          background:var(--bg-surface);
          border:1px solid var(--glass-border);
          border-radius:var(--radius-lg) var(--radius-lg) 0 0;
          padding:20px 16px 36px; z-index:201;
        }
        .crs-drawer-handle {
          width:40px; height:4px; background:var(--glass-border-hover);
          border-radius:2px; margin:0 auto 20px;
        }
        .crs-drawer-link {
          display:flex; align-items:center; gap:14px; padding:13px 14px;
          border-radius:var(--radius-sm); text-decoration:none;
          color:var(--text-secondary); font-size:0.9rem; font-weight:500;
          font-family:'DM Sans',sans-serif; transition:all 0.15s; margin-bottom:4px;
        }
        .crs-drawer-link:hover, .crs-drawer-link.active {
          background:var(--glass-bg); color:var(--text-primary);
        }
        .crs-drawer-link.active { color:#00E676; }
        .crs-drawer-icon {
          width:36px; height:36px; border-radius:9px; flex-shrink:0;
          background:var(--glass-bg); border:1px solid var(--glass-border);
          display:flex; align-items:center; justify-content:center;
        }

        /* ── Mobile breakpoint ────────────────────────────── */
        @media (max-width:768px) {
          .crs-sidebar       { display:none; }
          .crs-mobile-header { display:flex; }
          .crs-bottom-nav    { display:flex; }
          .crs-content       { padding-bottom:62px; }
        }
      `}</style>

      <div className="crs-root">

        {/* ── SIDEBAR ────────────────────────────────────── */}
        <aside className="crs-sidebar">
          <Link href="/dashboard" className="crs-logo">
            <div className="crs-logo-icon">
              <Route size={16} color="#FFD600" strokeWidth={1.5} />
            </div>
            <span className="crs-logo-text">CuentaRuta</span>
          </Link>

          <nav className="crs-nav">
            {NAV.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} className={`crs-link${isActive(href) ? " active" : ""}`}>
                <Icon size={17} strokeWidth={isActive(href) ? 2 : 1.5} style={{ flexShrink: 0 }} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="crs-footer">
            <div className="crs-user">
              <div className="crs-avatar">{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nombre || "…"}
                </p>
                <span className="crs-badge">Conductor</span>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 6px #00E676", flexShrink: 0 }} />
            </div>
            <button onClick={handleLogout} disabled={loggingOut} className="crs-logout">
              <LogOut size={14} strokeWidth={1.5} />
              {loggingOut ? "Cerrando…" : "Cerrar sesión"}
            </button>
          </div>
        </aside>

        {/* ── MAIN ───────────────────────────────────────── */}
        <div className="crs-main">
          <header className="crs-mobile-header">
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div className="crs-logo-icon" style={{ width: 28, height: 28 }}>
                <Route size={13} color="#FFD600" strokeWidth={1.5} />
              </div>
            </Link>
            <span className="crs-mobile-title">{pageTitle}</span>
            <div className="crs-avatar" style={{ width: 30, height: 30, fontSize: "0.7rem", cursor: "pointer" }} onClick={handleLogout}>
              {initials}
            </div>
          </header>

          <main className="crs-content">{children}</main>
        </div>

        {/* ── BOTTOM NAV ─────────────────────────────────── */}
        <nav className="crs-bottom-nav">
          {BOTTOM_NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className={`crs-tab${isActive(href) ? " active" : ""}`}>
              <Icon size={20} strokeWidth={isActive(href) ? 2 : 1.5} />
              <span>{label.split(" ")[0]}</span>
            </Link>
          ))}
          <button className={`crs-tab${drawerOpen ? " active" : ""}`} onClick={() => setDrawerOpen(true)}>
            <MoreHorizontal size={20} strokeWidth={1.5} />
            <span>Más</span>
          </button>
        </nav>

        {/* ── DRAWER "MÁS" ───────────────────────────────── */}
        {drawerOpen && (
          <>
            <div className="crs-overlay" onClick={() => setDrawerOpen(false)} />
            <div className="crs-drawer">
              <div className="crs-drawer-handle" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>Menú</p>
                <button onClick={() => setDrawerOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              {/* Links que no están en el bottom nav */}
              {[NAV[3], NAV[5], NAV[6]].map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}
                    className={`crs-drawer-link${active ? " active" : ""}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <div className="crs-drawer-icon">
                      <Icon size={18} strokeWidth={1.5} color={active ? "#00E676" : "var(--text-secondary)"} />
                    </div>
                    <span>{label}</span>
                    <ChevronRight size={16} strokeWidth={1.5} style={{ marginLeft: "auto", color: "var(--text-tertiary)" }} />
                  </Link>
                );
              })}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--glass-border)" }}>
                <div className="crs-user" style={{ marginBottom: 10 }}>
                  <div className="crs-avatar">{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {nombre || "…"}
                    </p>
                    <span className="crs-badge">Conductor</span>
                  </div>
                </div>
                <button onClick={handleLogout} disabled={loggingOut} className="crs-logout">
                  <LogOut size={14} strokeWidth={1.5} />
                  {loggingOut ? "Cerrando…" : "Cerrar sesión"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
