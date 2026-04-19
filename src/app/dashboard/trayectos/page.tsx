"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Route, Navigation, Plus, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, Check, AlertCircle, LogOut,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Estado = "pendiente" | "pagado" | "aprobado" | "rechazado";

interface Trayecto {
  id: string;
  fecha: string;
  semana: number;
  ruta: string | null;
  cliente: string | null;
  km_ini: number | null;
  km_fin: number | null;
  hora_ini: string | null;
  hora_fin: string | null;
  horas: number | null;
  extras: number;
  valor: number | null;
  factura: string | null;
  estado: Estado;
  notas: string | null;
}

type FormData = Omit<Trayecto, "id" | "semana">;

const EMPTY_FORM: FormData = {
  fecha: new Date().toISOString().slice(0, 10),
  ruta: "",
  cliente: "",
  km_ini: null,
  km_fin: null,
  hora_ini: null,
  hora_fin: null,
  horas: null,
  extras: 0,
  valor: null,
  factura: "",
  estado: "pendiente",
  notas: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoWeek(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7);
}

function currentWeek(): number {
  return isoWeek(new Date().toISOString().slice(0, 10));
}

function calcHoras(ini: string | null, fin: string | null): number | null {
  if (!ini || !fin) return null;
  const [h1, m1] = ini.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  return mins > 0 ? Math.round((mins / 60) * 100) / 100 : null;
}

function fmt(n: number | null, prefix = ""): string {
  if (n === null || n === undefined) return "—";
  return prefix + n.toLocaleString("es-CO");
}

const ESTADO_COLORS: Record<Estado, { bg: string; border: string; text: string }> = {
  pendiente: { bg: "var(--accent-yellow-dim)", border: "rgba(255,214,0,0.25)", text: "var(--accent-yellow)" },
  pagado:    { bg: "var(--accent-green-dim)",  border: "rgba(0,230,118,0.25)",  text: "var(--accent-green)" },
  aprobado:  { bg: "var(--accent-blue-dim)",   border: "rgba(68,136,255,0.25)", text: "var(--accent-blue)" },
  rechazado: { bg: "var(--accent-red-dim)",    border: "rgba(255,68,68,0.25)",  text: "var(--accent-red)" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--glass-border)",
  borderRadius: "var(--radius-sm)",
  padding: "11px 14px",
  color: "var(--text-primary)",
  fontSize: "0.9rem",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrayectosPage() {
  const [trayectos, setTrayectos] = useState<Trayecto[]>([]);
  const [semana, setSemana] = useState(currentWeek());
  const [filtroEstado, setFiltroEstado] = useState<Estado | "todos">("todos");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [plan, setPlan] = useState("conductor");

  // Modal
  const [modal, setModal] = useState<"nuevo" | "editar" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Load user + trayectos ──
  const load = useCallback(async (uid: string, sem: number) => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("cr_trayectos")
      .select("*")
      .eq("conductor_id", uid)
      .eq("semana", sem)
      .order("fecha", { ascending: false });
    setTrayectos((data as Trayecto[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      setUserName(user.user_metadata?.nombre ?? user.email?.split("@")[0] ?? "Usuario");
      setPlan(user.user_metadata?.plan ?? "conductor");
      load(user.id, semana);
    });
  }, [semana, load]);

  // ── Form helpers ──
  function setF<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Auto-calc horas
      if (key === "hora_ini" || key === "hora_fin") {
        const h = calcHoras(
          key === "hora_ini" ? (value as string) : f.hora_ini,
          key === "hora_fin" ? (value as string) : f.hora_fin,
        );
        next.horas = h;
      }
      return next;
    });
  }

  function openNuevo() {
    setForm({ ...EMPTY_FORM, fecha: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setEditId(null);
    setModal("nuevo");
  }

  function openEditar(t: Trayecto) {
    setForm({
      fecha: t.fecha,
      ruta: t.ruta ?? "",
      cliente: t.cliente ?? "",
      km_ini: t.km_ini,
      km_fin: t.km_fin,
      hora_ini: t.hora_ini,
      hora_fin: t.hora_fin,
      horas: t.horas,
      extras: t.extras ?? 0,
      valor: t.valor,
      factura: t.factura ?? "",
      estado: t.estado,
      notas: t.notas ?? "",
    });
    setFormError("");
    setEditId(t.id);
    setModal("editar");
  }

  async function handleSave() {
    if (!userId) return;
    if (!form.fecha) { setFormError("La fecha es obligatoria."); return; }
    setSaving(true);
    setFormError("");
    const supabase = createClient();

    const payload = {
      conductor_id: userId,
      fecha: form.fecha,
      semana: isoWeek(form.fecha),
      ruta: form.ruta || null,
      cliente: form.cliente || null,
      km_ini: form.km_ini,
      km_fin: form.km_fin,
      hora_ini: form.hora_ini || null,
      hora_fin: form.hora_fin || null,
      horas: form.horas,
      extras: form.extras ?? 0,
      valor: form.valor,
      factura: form.factura || null,
      estado: form.estado,
      notas: form.notas || null,
    };

    let err;
    if (modal === "editar" && editId) {
      ({ error: err } = await supabase.from("cr_trayectos").update(payload).eq("id", editId));
    } else {
      ({ error: err } = await supabase.from("cr_trayectos").insert(payload));
    }

    setSaving(false);
    if (err) { setFormError(err.message); return; }
    setModal(null);
    if (userId) load(userId, semana);
  }

  async function handleDelete() {
    if (!deleteId || !userId) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("cr_trayectos").delete().eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    load(userId, semana);
  }

  // ── Derived ──
  const filtered = filtroEstado === "todos"
    ? trayectos
    : trayectos.filter((t) => t.estado === filtroEstado);

  const totKm    = trayectos.reduce((s, t) => s + ((t.km_fin ?? 0) - (t.km_ini ?? 0)), 0);
  const totHoras = trayectos.reduce((s, t) => s + (t.horas ?? 0), 0);
  const totValor = trayectos.reduce((s, t) => s + (t.valor ?? 0), 0);

  return (
    <>
      <style>{`
        body { background: var(--bg-base); }
        input::placeholder, textarea::placeholder { color: var(--text-tertiary); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px var(--bg-elevated) inset !important;
          -webkit-text-fill-color: var(--text-primary) !important;
        }
        .tray-row {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          padding: 16px;
          transition: border-color 0.18s;
        }
        .tray-row:hover { border-color: var(--glass-border-hover); }
        .icon-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-tertiary); display: flex; align-items: center;
          padding: 6px; border-radius: 6px; transition: color 0.15s, background 0.15s;
        }
        .icon-btn:hover { color: var(--text-primary); background: var(--bg-elevated); }
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px); z-index: 200;
          display: flex; align-items: flex-end; justify-content: center;
        }
        @media (min-width: 640px) {
          .overlay { align-items: center; }
          .modal-box { border-radius: var(--radius-lg) !important; max-height: 92vh !important; }
        }
        .modal-box {
          width: 100%; max-width: 520px; background: var(--bg-surface);
          border: 1px solid var(--glass-border); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          padding: 28px 24px 32px; overflow-y: auto; max-height: 95vh;
        }
        select option { background: var(--bg-surface); }
      `}</style>

      {/* Topbar */}
      <header style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(8,12,24,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Route size={16} color="var(--accent-yellow)" strokeWidth={1.5} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>CuentaRuta</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ background: plan === "contratista" ? "var(--accent-blue-dim)" : "var(--accent-green-dim)", border: `1px solid ${plan === "contratista" ? "rgba(68,136,255,0.2)" : "rgba(0,230,118,0.2)"}`, color: plan === "contratista" ? "var(--accent-blue)" : "var(--accent-green)", borderRadius: 100, padding: "3px 12px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
              {plan}
            </span>
            <Link href="/api/auth/signout" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500 }}>
              <LogOut size={16} strokeWidth={1.5} />
              Salir
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "36px 16px 80px" }}>

        {/* Breadcrumb + title */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/dashboard" style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Navigation size={20} color="var(--accent-green)" strokeWidth={1.5} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  Trayectos
                </h1>
                <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                  {userName}
                </p>
              </div>
            </div>
            <button
              onClick={openNuevo}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.88rem", padding: "10px 18px" }}
            >
              <Plus size={16} strokeWidth={2} />
              Nuevo
            </button>
          </div>
        </div>

        {/* Week navigator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setSemana((s) => s - 1)}
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", padding: "8px 14px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600 }}
          >
            <ChevronLeft size={16} /> Ant.
          </button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: "1rem" }}>Semana {semana}</p>
            {semana === currentWeek() && (
              <span style={{ fontSize: "0.7rem", color: "var(--accent-green)", fontWeight: 600 }}>● Semana actual</span>
            )}
          </div>
          <button
            onClick={() => setSemana((s) => s + 1)}
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", padding: "8px 14px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600 }}
          >
            Sig. <ChevronRight size={16} />
          </button>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Km recorridos", value: totKm > 0 ? fmt(Math.round(totKm)) : "—", color: "var(--accent-green)" },
            { label: "Horas",         value: totHoras > 0 ? fmt(Math.round(totHoras * 10) / 10) : "—", color: "var(--accent-blue)" },
            { label: "Ingresos",      value: totValor > 0 ? "$" + fmt(totValor) : "—", color: "var(--accent-yellow)" },
          ].map((k) => (
            <div key={k.label} style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", padding: "14px 12px", textAlign: "center" }}>
              <p style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{k.label}</p>
              <p className="font-display tabular-nums" style={{ fontSize: "1.35rem", fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {(["todos", "pendiente", "pagado", "aprobado", "rechazado"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setFiltroEstado(e)}
              style={{
                background: filtroEstado === e ? "var(--accent-green-dim)" : "var(--glass-bg)",
                border: `1px solid ${filtroEstado === e ? "rgba(0,230,118,0.3)" : "var(--glass-border)"}`,
                color: filtroEstado === e ? "var(--accent-green)" : "var(--text-secondary)",
                borderRadius: 100,
                padding: "5px 14px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {e === "todos" ? "Todos" : e}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-tertiary)", fontSize: "0.9rem" }}>
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Navigation size={24} color="var(--text-tertiary)" strokeWidth={1.5} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6 }}>
              {filtroEstado === "todos" ? "Sin trayectos esta semana" : `Sin trayectos "${filtroEstado}"`}
            </p>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
              Pulsa <strong>Nuevo</strong> para registrar tu primer trayecto.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((t) => {
              const ec = ESTADO_COLORS[t.estado];
              const km = t.km_fin != null && t.km_ini != null ? t.km_fin - t.km_ini : null;
              return (
                <div key={t.id} className="tray-row">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>{t.fecha}</span>
                        <span style={{ background: ec.bg, border: `1px solid ${ec.border}`, color: ec.text, borderRadius: 100, padding: "2px 9px", fontSize: "0.68rem", fontWeight: 700, textTransform: "capitalize" }}>
                          {t.estado}
                        </span>
                      </div>
                      <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.ruta || "Sin ruta"}{t.cliente ? ` · ${t.cliente}` : ""}
                      </p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {km != null && (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>{fmt(km)}</span> km
                          </span>
                        )}
                        {t.horas != null && (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <span style={{ fontWeight: 700 }}>{t.horas}</span> h
                          </span>
                        )}
                        {t.valor != null && (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <span style={{ color: "var(--accent-yellow)", fontWeight: 700 }}>${fmt(t.valor)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="icon-btn" onClick={() => openEditar(t)} title="Editar">
                        <Pencil size={15} strokeWidth={1.5} />
                      </button>
                      <button className="icon-btn" onClick={() => setDeleteId(t.id)} title="Eliminar" style={{ color: "var(--accent-red)" }}>
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  {t.notas && (
                    <p style={{ marginTop: 8, fontSize: "0.78rem", color: "var(--text-tertiary)", borderTop: "1px solid var(--glass-border)", paddingTop: 8 }}>
                      {t.notas}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── MODAL FORM ─────────────────────────────────────────────────────────── */}
      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
                {modal === "nuevo" ? "Nuevo trayecto" : "Editar trayecto"}
              </h2>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Fecha */}
              <div>
                <label style={labelStyle}>Fecha *</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setF("fecha", e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Ruta + Cliente */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ruta</label>
                  <input type="text" placeholder="Bogotá → Villavicencio" value={form.ruta ?? ""} onChange={(e) => setF("ruta", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cliente</label>
                  <input type="text" placeholder="Empresa S.A." value={form.cliente ?? ""} onChange={(e) => setF("cliente", e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Km ini / fin */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Km inicial</label>
                  <input type="number" min={0} placeholder="45320" value={form.km_ini ?? ""} onChange={(e) => setF("km_ini", e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Km final</label>
                  <input type="number" min={0} placeholder="45680" value={form.km_fin ?? ""} onChange={(e) => setF("km_fin", e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
                </div>
              </div>
              {form.km_ini != null && form.km_fin != null && form.km_fin > form.km_ini && (
                <p style={{ marginTop: -8, fontSize: "0.78rem", color: "var(--accent-green)" }}>
                  ✓ {fmt(form.km_fin - form.km_ini)} km recorridos
                </p>
              )}

              {/* Hora ini / fin */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Hora salida</label>
                  <input type="time" value={form.hora_ini ?? ""} onChange={(e) => setF("hora_ini", e.target.value || null)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hora llegada</label>
                  <input type="time" value={form.hora_fin ?? ""} onChange={(e) => setF("hora_fin", e.target.value || null)} style={inputStyle} />
                </div>
              </div>
              {form.horas != null && (
                <p style={{ marginTop: -8, fontSize: "0.78rem", color: "var(--accent-blue)" }}>
                  ✓ {form.horas} horas en ruta
                </p>
              )}

              {/* Valor + Extras */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Valor ($)</label>
                  <input type="number" min={0} placeholder="450000" value={form.valor ?? ""} onChange={(e) => setF("valor", e.target.value ? Number(e.target.value) : null)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Extras ($)</label>
                  <input type="number" min={0} placeholder="0" value={form.extras ?? 0} onChange={(e) => setF("extras", Number(e.target.value))} style={inputStyle} />
                </div>
              </div>

              {/* Factura */}
              <div>
                <label style={labelStyle}>Factura / Remisión</label>
                <input type="text" placeholder="FAC-2026-001" value={form.factura ?? ""} onChange={(e) => setF("factura", e.target.value)} style={inputStyle} />
              </div>

              {/* Estado */}
              <div>
                <label style={labelStyle}>Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setF("estado", e.target.value as Estado)}
                  style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none" }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="pagado">Pagado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label style={labelStyle}>Notas</label>
                <textarea
                  rows={3}
                  placeholder="Observaciones del viaje..."
                  value={form.notas ?? ""}
                  onChange={(e) => setF("notas", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              {formError && (
                <div style={{ background: "var(--accent-red-dim)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "0.85rem", color: "var(--accent-red)", display: "flex", gap: 8, alignItems: "center" }}>
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
                style={{ width: "100%", opacity: saving ? 0.7 : 1, fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {saving ? "Guardando..." : <><Check size={16} strokeWidth={2} /> {modal === "nuevo" ? "Guardar trayecto" : "Actualizar"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ─────────────────────────────────────────────────────── */}
      {deleteId && (
        <div className="overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-red-dim)", border: "1px solid rgba(255,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trash2 size={22} color="var(--accent-red)" strokeWidth={1.5} />
              </div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: "1.1rem", marginBottom: 8 }}>
                ¿Eliminar trayecto?
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: 28 }}>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{ flex: 1, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ flex: 1, background: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "11px", color: "var(--accent-red)", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", opacity: deleting ? 0.7 : 1 }}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
