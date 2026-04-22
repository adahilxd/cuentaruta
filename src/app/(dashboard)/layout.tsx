"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Navigation, Wallet, CalendarDays,
  FileWarning, Calculator, Settings, Route,
  MoreHorizontal, X, LogOut, ChevronDown, Menu, Users,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import NotificationBell from "@/components/NotificationBell";

// ── Nav config ─────────────────────────────────────────────────────────
type SubItem = { label: string; href: string; sep?: true };
type NavItem = {
  key: string; href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties; color?: string }>;
  label: string;
  sub?: SubItem[];
};

const VIATICO_CONCEPTOS = [
  "ACPM", "Peaje", "Alimentacion", "Lavada",
  "Hotel", "Montallantas", "Mantenimiento", "Otro",
];

function buildNav(semanas: number[]): NavItem[] {
  const semSub: SubItem[] = semanas.length > 0
    ? [
        { label: "sep", href: "", sep: true },
        ...semanas.map(s => ({ label: `Sem. ${s}`, href: `/trayectos?semana=${s}` })),
      ]
    : [];
  return [
    { key: "dashboard",    href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
    {
      key: "trayectos", href: "/trayectos", icon: Navigation, label: "Trayectos",
      sub: [
        { label: "Todos",      href: "/trayectos" },
        { label: "Pagados",    href: "/trayectos?estado=pagado" },
        { label: "Pendientes", href: "/trayectos?estado=pendiente" },
        ...semSub,
      ],
    },
    {
      key: "viaticos", href: "/viaticos", icon: Wallet, label: "Viáticos",
      sub: [
        { label: "Todos", href: "/viaticos" },
        ...VIATICO_CONCEPTOS.map(c => ({ label: c, href: `/viaticos?concepto=${c}` })),
      ],
    },
    {
      key: "flujo", href: "/flujo", icon: CalendarDays, label: "Flujo Semanal",
      sub: [
        { label: "Todas",      href: "/flujo" },
        { label: "Pagadas",    href: "/flujo?estado=pagado" },
        { label: "Pendientes", href: "/flujo?estado=pendiente" },
      ],
    },
    {
      key: "documentos", href: "/documentos", icon: FileWarning, label: "Documentos",
      sub: [
        { label: "Todos",        href: "/documentos" },
        { label: "Vigentes",     href: "/documentos?estado=vigente" },
        { label: "Vence pronto", href: "/documentos?estado=vence_pronto" },
        { label: "Vencidos",     href: "/documentos?estado=vencido" },
      ],
    },
    { key: "liquidacion",  href: "/liquidacion",  icon: Calculator, label: "Liquidación" },
    { key: "configuracion",href: "/configuracion", icon: Settings,   label: "Configuración" },
    { key: "contratista",  href: "/contratista",  icon: Users,      label: "Mi Flota" },
  ];
}

const SUBMENU_KEYS = new Set(["trayectos", "viaticos", "flujo", "documentos"]);
const BOTTOM_TAB_KEYS = ["dashboard", "trayectos", "viaticos", "documentos"];
const MORE_KEYS_CONDUCTOR   = ["flujo", "liquidacion", "configuracion"];
const MORE_KEYS_CONTRATISTA = ["contratista", "flujo", "configuracion"];

// ── Chip config ────────────────────────────────────────────────────────
type Chip = { label: string; href: string };

function getChips(pathname: string, semanas: number[]): Chip[] | null {
  if (pathname.startsWith("/trayectos"))
    return [
      { label: "Todos",      href: "/trayectos" },
      { label: "Pagados",    href: "/trayectos?estado=pagado" },
      { label: "Pendientes", href: "/trayectos?estado=pendiente" },
      ...semanas.map(s => ({ label: `S${s}`, href: `/trayectos?semana=${s}` })),
    ];
  if (pathname.startsWith("/viaticos"))
    return [
      { label: "Todos", href: "/viaticos" },
      ...VIATICO_CONCEPTOS.map(c => ({ label: c, href: `/viaticos?concepto=${c}` })),
    ];
  if (pathname.startsWith("/documentos"))
    return [
      { label: "Todos",        href: "/documentos" },
      { label: "Vigentes",     href: "/documentos?estado=vigente" },
      { label: "Vence pronto", href: "/documentos?estado=vence_pronto" },
      { label: "Vencidos",     href: "/documentos?estado=vencido" },
    ];
  if (pathname.startsWith("/flujo"))
    return [
      { label: "Todas",      href: "/flujo" },
      { label: "Pagadas",    href: "/flujo?estado=pagado" },
      { label: "Pendientes", href: "/flujo?estado=pendiente" },
    ];
  return null;
}

function isHrefActive(href: string, pathname: string, sp: URLSearchParams): boolean {
  const [hPath, hQs] = href.split("?");
  if (hPath !== pathname) return false;
  if (!hQs) return !sp.toString();
  const hParams = new URLSearchParams(hQs);
  for (const [k, v] of hParams) {
    if (sp.get(k) !== v) return false;
  }
  return true;
}

// ── Layout ─────────────────────────────────────────────────────────────
function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const [openMenu,   setOpenMenu]   = useState<string | null>(null);
  const [semanas,    setSemanas]    = useState<number[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen,   setMoreOpen]   = useState(false);
  const [nombre,     setNombre]     = useState("");
  const [rol,        setRol]        = useState("conductor");
  const [loggingOut, setLoggingOut] = useState(false);

  const prevModuleRef = useRef<string | null>(null);

  // Auto-open matching submenu when module changes
  useEffect(() => {
    const module = pathname.split("/")[1];
    if (module !== prevModuleRef.current) {
      prevModuleRef.current = module;
      setOpenMenu(SUBMENU_KEYS.has(module) ? module : null);
    }
  }, [pathname]);

  // Close overlays on navigation
  useEffect(() => {
    setDrawerOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Load user data and semanas
  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const [{ data: u }, { data: sem }] = await Promise.all([
        sb.from("cr_usuarios").select("nombre, rol").eq("id", user.id).single(),
        sb.from("cr_trayectos").select("semana").eq("conductor_id", user.id),
      ]);
      setNombre(u?.nombre ?? "");
      setRol((u as { rol?: string } | null)?.rol ?? "conductor");
      if (sem) {
        const unique = [...new Set((sem as { semana: number }[]).map(r => r.semana))]
          .filter(Boolean).sort((a, b) => a - b);
        setSemanas(unique);
      }
    })();
  }, []);

  const isContratista = rol === "contratista";
  const MORE_KEYS = isContratista ? MORE_KEYS_CONTRATISTA : MORE_KEYS_CONDUCTOR;

  const allNav = buildNav(semanas);
  const nav    = isContratista ? allNav : allNav.filter(n => n.key !== "contratista");
  const chips  = getChips(pathname, semanas);

  const initials = nombre.split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase() || "?";

  function isModuleActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  const pageTitle = nav.find(n => isModuleActive(n.href))?.label ?? "Dashboard";

  function toggleMenu(key: string) {
    setOpenMenu(prev => prev === key ? null : key);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  function closeAll() {
    setDrawerOpen(false);
    setMoreOpen(false);
  }

  // ── Render nav (sidebar + drawer share same markup) ─────────────────
  function renderNav(onLinkClick?: () => void) {
    return (
      <nav className="crs-nav">
        {nav.map(({ key, href, icon: Icon, label, sub }) => {
          const moduleActive = isModuleActive(href);
          const isOpen = openMenu === key;

          if (!sub) {
            return (
              <Link key={key} href={href}
                className={`crs-link${moduleActive ? " active" : ""}`}
                onClick={onLinkClick}>
                <Icon size={17} strokeWidth={moduleActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
                {label}
              </Link>
            );
          }

          return (
            <div key={key} className="crs-nav-item">
              <button
                className={`crs-link crs-link-btn${moduleActive ? " active" : ""}`}
                onClick={() => toggleMenu(key)}>
                <Icon size={17} strokeWidth={moduleActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                <ChevronDown size={14} className={`crs-chevron${isOpen ? " open" : ""}`} />
              </button>
              <div className={`crs-submenu${isOpen ? " open" : ""}`}>
                {sub.map((item, i) => {
                  if (item.sep) return <div key={i} className="crs-separator" />;
                  const subActive = isHrefActive(item.href, pathname, searchParams);
                  return (
                    <Link key={item.href + i} href={item.href}
                      className={`crs-sub-link${subActive ? " active" : ""}`}
                      onClick={onLinkClick}>
                      {subActive && <span className="crs-dot" />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    );
  }

  const bottomTabs = nav.filter(n => BOTTOM_TAB_KEYS.includes(n.key))
    .sort((a, b) => BOTTOM_TAB_KEYS.indexOf(a.key) - BOTTOM_TAB_KEYS.indexOf(b.key));

  const moreItems = nav.filter(n => MORE_KEYS.includes(n.key));

  return (
    <>
      <style>{`
        /* ── Root ──────────────────────────────────────── */
        .crs-root { display:flex; min-height:100vh; background:var(--bg-base); }

        /* ── Sidebar ────────────────────────────────────── */
        .crs-sidebar {
          width:240px; flex-shrink:0; height:100vh; position:sticky; top:0;
          display:flex; flex-direction:column;
          background:var(--bg-surface);
          border-right:1px solid var(--glass-border);
          z-index:50; overflow:hidden;
        }
        .crs-logo {
          display:flex; align-items:center; gap:10px;
          padding:20px 16px 16px;
          border-bottom:1px solid var(--glass-border);
          text-decoration:none; flex-shrink:0;
        }
        .crs-logo-icon {
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          background:rgba(255,214,0,0.12); border:1px solid rgba(255,214,0,0.25);
          display:flex; align-items:center; justify-content:center;
        }
        .crs-logo-text {
          font-family:'Sora',sans-serif; font-weight:800; font-size:1rem;
          color:var(--text-primary); letter-spacing:-0.02em;
        }

        /* Nav list */
        .crs-nav {
          flex:1; padding:10px 8px; display:flex; flex-direction:column; gap:1px;
          overflow-y:auto; overflow-x:hidden;
          scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.08) transparent;
        }
        .crs-nav-item { display:flex; flex-direction:column; }

        /* Parent link / button */
        .crs-link {
          display:flex; align-items:center; gap:10px;
          padding:9px 12px; border-radius:var(--radius-sm);
          text-decoration:none; font-size:0.875rem; font-weight:500;
          color:var(--text-secondary); font-family:'DM Sans',sans-serif;
          transition:background 0.15s,color 0.15s;
          border-left:3px solid transparent;
        }
        .crs-link-btn {
          display:flex; align-items:center; gap:10px;
          padding:9px 12px; border-radius:var(--radius-sm);
          font-size:0.875rem; font-weight:500;
          color:var(--text-secondary); font-family:'DM Sans',sans-serif;
          transition:background 0.15s,color 0.15s;
          border:none; border-left:3px solid transparent;
          background:none; cursor:pointer; width:100%;
        }
        .crs-link:hover, .crs-link-btn:hover {
          background:rgba(255,255,255,0.05); color:var(--text-primary);
        }
        .crs-link.active, .crs-link-btn.active {
          background:rgba(0,230,118,0.10); color:#00E676;
          border-left-color:#00E676; font-weight:600;
        }

        /* Chevron */
        .crs-chevron { transition:transform 300ms ease; flex-shrink:0; color:var(--text-tertiary); }
        .crs-chevron.open { transform:rotate(180deg); }

        /* Collapsible submenu */
        .crs-submenu { overflow:hidden; max-height:0; transition:max-height 300ms ease; }
        .crs-submenu.open { max-height:800px; overflow-y:auto; }

        /* Sub-item links */
        .crs-sub-link {
          display:flex; align-items:center; gap:6px;
          padding:7px 12px 7px 32px;
          border-radius:var(--radius-sm);
          text-decoration:none; font-size:0.82rem; font-weight:400;
          color:#8892A4; font-family:'DM Sans',sans-serif;
          transition:background 0.12s,color 0.12s;
        }
        .crs-sub-link:hover { background:rgba(255,255,255,0.04); color:#F0F4FF; }
        .crs-sub-link.active { color:#00E676; font-weight:600; }
        .crs-dot { width:5px; height:5px; border-radius:50%; background:#00E676; flex-shrink:0; }
        .crs-separator { height:1px; background:rgba(255,255,255,0.06); margin:4px 12px; }

        /* Footer */
        .crs-footer { padding:12px 8px 16px; border-top:1px solid var(--glass-border); flex-shrink:0; }
        .crs-user {
          display:flex; align-items:center; gap:10px; padding:10px 12px;
          border-radius:var(--radius-sm);
          background:var(--glass-bg); border:1px solid var(--glass-border); margin-bottom:8px;
        }
        .crs-avatar {
          width:32px; height:32px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#FFD600,#00E676);
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:0.75rem; color:#080C18;
        }
        .crs-badge {
          display:inline-flex; align-items:center;
          padding:2px 8px; border-radius:100px; font-size:0.68rem; font-weight:700;
          background:rgba(0,230,118,0.12); border:1px solid rgba(0,230,118,0.2); color:#00E676;
        }
        .crs-logout {
          display:flex; align-items:center; gap:8px; width:100%;
          padding:8px 12px; border-radius:var(--radius-sm);
          background:none; border:1px solid var(--glass-border);
          color:var(--text-tertiary); font-size:0.82rem; font-weight:500;
          cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s;
        }
        .crs-logout:hover { color:var(--accent-red); border-color:rgba(255,68,68,0.3); background:rgba(255,68,68,0.08); }

        /* ── Main ──────────────────────────────────────── */
        .crs-main { flex:1; min-width:0; display:flex; flex-direction:column; }
        .crs-content { flex:1; min-width:0; }

        /* ── Mobile header ──────────────────────────────── */
        .crs-mobile-header {
          display:none; height:56px; position:sticky; top:0; z-index:100;
          background:rgba(8,12,24,0.95); border-bottom:1px solid var(--glass-border);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          align-items:center; justify-content:space-between; padding:0 16px;
          flex-shrink:0;
        }
        .crs-mobile-title {
          font-family:'Sora',sans-serif; font-weight:700; font-size:0.95rem;
          color:var(--text-primary); position:absolute; left:50%; transform:translateX(-50%);
          white-space:nowrap; pointer-events:none;
        }
        .crs-hamburger {
          background:none; border:none; cursor:pointer;
          color:var(--text-secondary); padding:6px;
          display:flex; align-items:center; transition:color 0.15s; border-radius:8px;
        }
        .crs-hamburger:hover { color:var(--text-primary); }

        /* ── Chips bar ──────────────────────────────────── */
        .crs-chips-bar {
          display:none; position:sticky; z-index:90;
          background:rgba(8,12,24,0.97);
          border-bottom:1px solid var(--glass-border);
          backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          padding:9px 0; flex-shrink:0;
        }
        .crs-chips-scroll {
          display:flex; gap:8px; overflow-x:auto; padding:0 14px;
          scrollbar-width:none;
        }
        .crs-chips-scroll::-webkit-scrollbar { display:none; }
        .crs-chip {
          flex-shrink:0; padding:6px 14px; border-radius:100px;
          font-size:0.78rem; font-weight:600; font-family:'DM Sans',sans-serif;
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10);
          color:var(--text-secondary); cursor:pointer; text-decoration:none;
          transition:all 0.15s; white-space:nowrap; min-height:34px;
          display:inline-flex; align-items:center;
        }
        .crs-chip:hover { background:rgba(255,255,255,0.10); color:var(--text-primary); }
        .crs-chip.active { background:rgba(0,230,118,0.12); border-color:rgba(0,230,118,0.35); color:#00E676; }

        /* ── Bottom nav ─────────────────────────────────── */
        .crs-bottom-nav {
          display:none; position:fixed; bottom:0; left:0; right:0; height:64px;
          background:rgba(8,12,30,0.97); border-top:1px solid rgba(255,255,255,0.08);
          backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
          z-index:100; align-items:stretch;
        }
        .crs-tab {
          flex:1; display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:3px; text-decoration:none;
          color:var(--text-tertiary); font-size:0.62rem; font-weight:600;
          font-family:'DM Sans',sans-serif; border:none; background:none;
          cursor:pointer; padding:0; transition:color 0.15s; min-height:44px;
        }
        .crs-tab.active { color:#00E676; }

        /* ── Overlay ────────────────────────────────────── */
        .crs-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.65);
          backdrop-filter:blur(4px); z-index:200;
          opacity:0; pointer-events:none; transition:opacity 250ms ease;
        }
        .crs-overlay.open { opacity:1; pointer-events:all; }

        /* ── Left drawer ────────────────────────────────── */
        .crs-left-drawer {
          position:fixed; top:0; left:0; bottom:0; width:280px;
          background:var(--bg-surface); border-right:1px solid var(--glass-border);
          z-index:201; display:flex; flex-direction:column;
          transform:translateX(-100%); transition:transform 250ms ease;
          overflow:hidden;
        }
        .crs-left-drawer.open { transform:translateX(0); }
        .crs-drawer-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 12px 14px 16px; border-bottom:1px solid var(--glass-border); flex-shrink:0;
        }
        .crs-drawer-close {
          background:none; border:none; cursor:pointer; color:var(--text-secondary);
          padding:6px; border-radius:8px; display:flex; align-items:center; transition:color 0.15s;
        }
        .crs-drawer-close:hover { color:var(--text-primary); }
        .crs-drawer-footer { padding:12px; border-top:1px solid var(--glass-border); flex-shrink:0; }

        /* ── More bottom sheet ──────────────────────────── */
        .crs-more-sheet {
          position:fixed; bottom:0; left:0; right:0;
          background:var(--bg-surface); border:1px solid var(--glass-border);
          border-radius:var(--radius-lg) var(--radius-lg) 0 0;
          padding:0 16px 40px; z-index:201;
          transform:translateY(100%); transition:transform 250ms ease;
        }
        .crs-more-sheet.open { transform:translateY(0); }
        .crs-sheet-handle {
          width:40px; height:4px; background:var(--glass-border-hover);
          border-radius:2px; margin:14px auto 16px;
        }
        .crs-sheet-link {
          display:flex; align-items:center; gap:14px; padding:13px 4px;
          text-decoration:none; color:var(--text-secondary); font-size:0.9rem; font-weight:500;
          font-family:'DM Sans',sans-serif; transition:color 0.15s;
          border-bottom:1px solid var(--glass-border);
        }
        .crs-sheet-link:last-child { border-bottom:none; }
        .crs-sheet-link.active { color:#00E676; }
        .crs-sheet-icon {
          width:36px; height:36px; border-radius:9px; flex-shrink:0;
          background:var(--glass-bg); border:1px solid var(--glass-border);
          display:flex; align-items:center; justify-content:center;
        }

        /* ── Mobile breakpoint ──────────────────────────── */
        @media (max-width:768px) {
          .crs-sidebar       { display:none; }
          .crs-mobile-header { display:flex; }
          .crs-chips-bar     { display:block; }
          .crs-bottom-nav    { display:flex; }
          .crs-content       { padding-bottom:64px; }
        }
      `}</style>

      <div className="crs-root">

        {/* ── SIDEBAR (desktop) ─────────────────────────── */}
        <aside className="crs-sidebar">
          <Link href="/dashboard" className="crs-logo">
            <div className="crs-logo-icon">
              <Route size={16} color="#FFD600" strokeWidth={1.5} />
            </div>
            <span className="crs-logo-text">CuentaRuta</span>
          </Link>

          {renderNav()}

          <div className="crs-footer">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <NotificationBell />
            </div>
            <div className="crs-user">
              <div className="crs-avatar">{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nombre || "…"}
                </p>
                <span className="crs-badge" style={isContratista ? { background: "rgba(255,214,0,0.12)", borderColor: "rgba(255,214,0,0.25)", color: "#FFD600" } : {}}>{isContratista ? "Contratista" : "Conductor"}</span>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 6px #00E676", flexShrink: 0 }} />
            </div>
            <button onClick={handleLogout} disabled={loggingOut} className="crs-logout">
              <LogOut size={14} strokeWidth={1.5} />
              {loggingOut ? "Cerrando…" : "Cerrar sesión"}
            </button>
          </div>
        </aside>

        {/* ── MAIN ──────────────────────────────────────── */}
        <div className="crs-main">
          {/* Mobile header */}
          <header className="crs-mobile-header">
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", zIndex: 1 }}>
              <div className="crs-logo-icon" style={{ width: 28, height: 28 }}>
                <Route size={13} color="#FFD600" strokeWidth={1.5} />
              </div>
            </Link>
            <span className="crs-mobile-title">{pageTitle}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <NotificationBell />
              <button className="crs-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Abrir menú">
                <Menu size={22} strokeWidth={1.5} />
              </button>
            </div>
          </header>

          {/* Mobile chips */}
          {chips && (
            <div className="crs-chips-bar">
              <div className="crs-chips-scroll">
                {chips.map((chip) => (
                  <Link
                    key={chip.href}
                    href={chip.href}
                    className={`crs-chip${isHrefActive(chip.href, pathname, searchParams) ? " active" : ""}`}
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <main className="crs-content">{children}</main>
        </div>

        {/* ── BOTTOM NAV ────────────────────────────────── */}
        <nav className="crs-bottom-nav">
          {bottomTabs.map(({ key, href, icon: Icon, label }) => {
            const active = isModuleActive(href);
            return (
              <Link key={key} href={href} className={`crs-tab${active ? " active" : ""}`}>
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span>{label.split(" ")[0]}</span>
              </Link>
            );
          })}
          <button className={`crs-tab${moreOpen ? " active" : ""}`} onClick={() => setMoreOpen(true)}>
            <MoreHorizontal size={20} strokeWidth={1.5} />
            <span>Más</span>
          </button>
        </nav>

        {/* ── OVERLAY (shared) ──────────────────────────── */}
        <div className={`crs-overlay${drawerOpen || moreOpen ? " open" : ""}`} onClick={closeAll} />

        {/* ── LEFT DRAWER (hamburger) ───────────────────── */}
        <div className={`crs-left-drawer${drawerOpen ? " open" : ""}`}>
          <div className="crs-drawer-header">
            <Link href="/dashboard" className="crs-logo" style={{ padding: 0, border: "none" }}
              onClick={() => setDrawerOpen(false)}>
              <div className="crs-logo-icon">
                <Route size={16} color="#FFD600" strokeWidth={1.5} />
              </div>
              <span className="crs-logo-text">CuentaRuta</span>
            </Link>
            <button className="crs-drawer-close" onClick={() => setDrawerOpen(false)}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          {renderNav(() => setDrawerOpen(false))}
          <div className="crs-drawer-footer">
            <div className="crs-user">
              <div className="crs-avatar">{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nombre || "…"}
                </p>
                <span className="crs-badge" style={isContratista ? { background: "rgba(255,214,0,0.12)", borderColor: "rgba(255,214,0,0.25)", color: "#FFD600" } : {}}>{isContratista ? "Contratista" : "Conductor"}</span>
              </div>
            </div>
            <button onClick={handleLogout} disabled={loggingOut} className="crs-logout">
              <LogOut size={14} strokeWidth={1.5} />
              {loggingOut ? "Cerrando…" : "Cerrar sesión"}
            </button>
          </div>
        </div>

        {/* ── MORE SHEET ────────────────────────────────── */}
        <div className={`crs-more-sheet${moreOpen ? " open" : ""}`}>
          <div className="crs-sheet-handle" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>Más opciones</p>
            <button onClick={() => setMoreOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          {moreItems.map(({ key, href, icon: Icon, label }) => {
            const active = isModuleActive(href);
            return (
              <Link key={key} href={href}
                className={`crs-sheet-link${active ? " active" : ""}`}
                onClick={() => setMoreOpen(false)}>
                <div className="crs-sheet-icon">
                  <Icon size={18} strokeWidth={1.5} color={active ? "#00E676" : "var(--text-secondary)"} />
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                <ChevronDown size={14} style={{ transform: "rotate(-90deg)", color: "var(--text-tertiary)" }} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <LayoutShell>{children}</LayoutShell>
    </Suspense>
  );
}
