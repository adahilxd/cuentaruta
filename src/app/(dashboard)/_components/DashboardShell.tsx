"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Navigation, Wallet, CalendarDays,
  FileText, Calculator, Settings, Route, MoreHorizontal,
  X, LogOut, CreditCard, ChevronRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ── Nav items ─────────────────────────────────────────────────────
const NAV = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/trayectos",    icon: Navigation,      label: "Trayectos"    },
  { href: "/viaticos",     icon: Wallet,          label: "Viáticos"     },
  { href: "/flujo",        icon: CalendarDays,    label: "Flujo Semanal"},
  { href: "/documentos",   icon: FileText,        label: "Documentos"   },
  { href: "/liquidacion",  icon: Calculator,      label: "Liquidación"  },
  { href: "/plan",         icon: CreditCard,      label: "Mi Plan"      },
  { href: "/configuracion",icon: Settings,        label: "Configuración"},
];

const BOTTOM_NAV = NAV.slice(0, 4); // Dashboard · Trayectos · Viáticos · Flujo

// ── Shell ─────────────────────────────────────────────────────────
export function DashboardShell({
  name, plan, email, children,
}: {
  name: string; plan: string; email: string; children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase() || "?";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const pageTitle = NAV.find((n) => isActive(n.href))?.label ?? "Dashboard";

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <style>{`
        /* ── Shell layout ─────────────────────────────── */
        .crs-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg-base);
        }

        /* ── Sidebar ──────────────────────────────────── */
        .crs-sidebar {
          width: 240px;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border-right: 1px solid var(--glass-border);
          z-index: 50;
          overflow-y: auto;
        }
        .crs-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--glass-border);
          text-decoration: none;
        }
        .crs-sidebar-logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: var(--accent-yellow-dim);
          border: 1px solid rgba(255,214,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .crs-sidebar-logo-text {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .crs-sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .crs-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.15s;
          border-left: 3px solid transparent;
          cursor: pointer;
          background: none;
          border-top: none;
          border-right: none;
          border-bottom: none;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
        }
        .crs-nav-item:hover {
          background: rgba(255,255,255,0.04);
          color: var(--text-primary);
        }
        .crs-nav-item.active {
          background: var(--accent-green-dim);
          color: var(--accent-green);
          border-left-color: var(--accent-green);
          font-weight: 600;
        }
        .crs-sidebar-footer {
          padding: 12px 10px 16px;
          border-top: 1px solid var(--glass-border);
        }
        .crs-avatar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          margin-bottom: 8px;
        }
        .crs-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-yellow), var(--accent-green));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.75rem;
          color: #080C18;
          flex-shrink: 0;
        }
        .crs-plan-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: capitalize;
          background: var(--accent-green-dim);
          border: 1px solid rgba(0,230,118,0.2);
          color: var(--accent-green);
        }
        .crs-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          background: none;
          border: 1px solid var(--glass-border);
          color: var(--text-tertiary);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .crs-logout-btn:hover {
          color: var(--accent-red);
          border-color: rgba(255,68,68,0.3);
          background: var(--accent-red-dim);
        }

        /* ── Main content ─────────────────────────────── */
        .crs-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        /* ── Mobile header ────────────────────────────── */
        .crs-mobile-header {
          display: none;
          height: 56px;
          background: rgba(8,12,24,0.92);
          border-bottom: 1px solid var(--glass-border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 100;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }
        .crs-mobile-title {
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        /* ── Page content wrapper ─────────────────────── */
        .crs-content {
          flex: 1;
          overflow-x: hidden;
        }

        /* ── Bottom nav ───────────────────────────────── */
        .crs-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 62px;
          background: rgba(8,12,24,0.95);
          border-top: 1px solid var(--glass-border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 100;
          align-items: stretch;
        }
        .crs-btm-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          color: var(--text-tertiary);
          font-size: 0.62rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .crs-btm-tab.active { color: var(--accent-green); }
        .crs-btm-tab-label { margin-top: 1px; }

        /* ── More drawer ──────────────────────────────── */
        .crs-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          z-index: 200;
        }
        .crs-drawer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          padding: 20px 16px 32px;
          z-index: 201;
        }
        .crs-drawer-handle {
          width: 40px;
          height: 4px;
          background: var(--glass-border-hover);
          border-radius: 2px;
          margin: 0 auto 20px;
        }
        .crs-drawer-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 14px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
          margin-bottom: 4px;
        }
        .crs-drawer-item:hover, .crs-drawer-item.active {
          background: var(--glass-bg);
          color: var(--text-primary);
        }
        .crs-drawer-item.active { color: var(--accent-green); }
        .crs-drawer-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Mobile breakpoint ────────────────────────── */
        @media (max-width: 768px) {
          .crs-sidebar { display: none; }
          .crs-mobile-header { display: flex; }
          .crs-bottom-nav { display: flex; }
          .crs-content { padding-bottom: 62px; }
        }
      `}</style>

      <div className="crs-root">
        {/* ── SIDEBAR DESKTOP ──────────────────────────── */}
        <aside className="crs-sidebar">
          {/* Logo */}
          <Link href="/dashboard" className="crs-sidebar-logo">
            <div className="crs-sidebar-logo-icon">
              <Route size={16} color="var(--accent-yellow)" strokeWidth={1.5} />
            </div>
            <span className="crs-sidebar-logo-text">CuentaRuta</span>
          </Link>

          {/* Nav */}
          <nav className="crs-sidebar-nav">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`crs-nav-item${active ? " active" : ""}`}
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2 : 1.5}
                    style={{ flexShrink: 0 }}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer: avatar + logout */}
          <div className="crs-sidebar-footer">
            <div className="crs-avatar">
              <div className="crs-avatar-circle">{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </p>
                <span className="crs-plan-badge">{plan}</span>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 6px var(--accent-green)", flexShrink: 0 }} />
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="crs-logout-btn"
            >
              <LogOut size={14} strokeWidth={1.5} />
              {loggingOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </aside>

        {/* ── MAIN ─────────────────────────────────────── */}
        <div className="crs-main">
          {/* Mobile header */}
          <header className="crs-mobile-header">
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div className="crs-sidebar-logo-icon" style={{ width: 28, height: 28 }}>
                <Route size={14} color="var(--accent-yellow)" strokeWidth={1.5} />
              </div>
            </Link>

            <span className="crs-mobile-title">{pageTitle}</span>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <div className="crs-avatar-circle" style={{ width: 30, height: 30, fontSize: "0.7rem" }}>
                {initials}
              </div>
            </button>
          </header>

          {/* Page content */}
          <main className="crs-content">{children}</main>
        </div>

        {/* ── BOTTOM NAV MÓVIL ─────────────────────────── */}
        <nav className="crs-bottom-nav">
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`crs-btm-tab${active ? " active" : ""}`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span className="crs-btm-tab-label">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}

          {/* Más */}
          <button
            className={`crs-btm-tab${drawerOpen ? " active" : ""}`}
            onClick={() => setDrawerOpen(true)}
          >
            <MoreHorizontal size={20} strokeWidth={1.5} />
            <span className="crs-btm-tab-label">Más</span>
          </button>
        </nav>

        {/* ── DRAWER "MÁS" ─────────────────────────────── */}
        {drawerOpen && (
          <>
            <div className="crs-drawer-overlay" onClick={() => setDrawerOpen(false)} />
            <div className="crs-drawer">
              <div className="crs-drawer-handle" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>Menú</p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              {NAV.slice(4).map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`crs-drawer-item${active ? " active" : ""}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <div className="crs-drawer-icon">
                      <Icon size={18} strokeWidth={1.5} color={active ? "var(--accent-green)" : "var(--text-secondary)"} />
                    </div>
                    <span>{item.label}</span>
                    <ChevronRight size={16} strokeWidth={1.5} style={{ marginLeft: "auto", color: "var(--text-tertiary)" }} />
                  </Link>
                );
              })}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--glass-border)" }}>
                <div className="crs-avatar" style={{ marginBottom: 10 }}>
                  <div className="crs-avatar-circle">{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} disabled={loggingOut} className="crs-logout-btn">
                  <LogOut size={14} strokeWidth={1.5} />
                  {loggingOut ? "Cerrando..." : "Cerrar sesión"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
