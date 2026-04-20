"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getTrayectos, formatCurrency, fmtFecha } from "@/lib/supabase/queries";
import {
  Plus, X, Search, ChevronDown, Check,
  Navigation, Pencil, Trash2,
} from "lucide-react";

type Trayecto = {
  id: string; fecha: string; semana: number;
  origen: string; destino: string;
  km: number | null; valor: number | null; extras: number | null;
  estado: string; factura: string | null; notas: string | null;
};

const ESTADOS = ["pendiente", "pagado", "en_revision"];
const SEMANAS = Array.from({ length: 15 }, (_, i) => i + 1);

// ── Modal de formulario ───────────────────────────────────────────────
function TrayectoModal({
  trayecto, onClose, onSave,
}: {
  trayecto: Partial<Trayecto> | null;
  onClose: () => void;
  onSave: (data: Partial<Trayecto>) => Promise<void>;
}) {
  const isNew = !trayecto?.id;
  const [form, setForm] = useState<Partial<Trayecto>>(
    trayecto ?? { estado: "pendiente", fecha: new Date().toISOString().slice(0, 10) }
  );
  const [saving, setSaving] = useState(false);

  function set(k: keyof Trayecto, v: unknown) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }} onClick={onClose}>
      <form onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--glass-border)", padding: "28px",
          width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 18 }}>
            {isNew ? "Nuevo trayecto" : "Editar trayecto"}
          </h2>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label style={{ gridColumn: "1/-1" }} className="form-group">
            <span>Fecha</span>
            <input type="date" value={form.fecha ?? ""} onChange={(e) => set("fecha", e.target.value)} required />
          </label>
          <label className="form-group">
            <span>Semana</span>
            <select value={form.semana ?? ""} onChange={(e) => set("semana", Number(e.target.value))} required>
              <option value="">Seleccionar</option>
              {SEMANAS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="form-group">
            <span>Estado</span>
            <select value={form.estado ?? "pendiente"} onChange={(e) => set("estado", e.target.value)}>
              {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label style={{ gridColumn: "1/-1" }} className="form-group">
            <span>Origen</span>
            <input type="text" value={form.origen ?? ""} onChange={(e) => set("origen", e.target.value)} required placeholder="Ciudad / municipio" />
          </label>
          <label style={{ gridColumn: "1/-1" }} className="form-group">
            <span>Destino</span>
            <input type="text" value={form.destino ?? ""} onChange={(e) => set("destino", e.target.value)} required placeholder="Ciudad / municipio" />
          </label>
          <label className="form-group">
            <span>Kilómetros</span>
            <input type="number" min={0} value={form.km ?? ""} onChange={(e) => set("km", e.target.value ? Number(e.target.value) : null)} placeholder="0" />
          </label>
          <label className="form-group">
            <span>Valor (COP)</span>
            <input type="number" min={0} value={form.valor ?? ""} onChange={(e) => set("valor", e.target.value ? Number(e.target.value) : null)} placeholder="0" />
          </label>
          <label className="form-group">
            <span>Horas extras</span>
            <input type="number" min={0} value={form.extras ?? ""} onChange={(e) => set("extras", e.target.value ? Number(e.target.value) : null)} placeholder="0" />
          </label>
          <label className="form-group">
            <span>N° Factura / Trayecto</span>
            <input type="text" value={form.factura ?? ""} onChange={(e) => set("factura", e.target.value || null)} placeholder="Opcional" />
          </label>
          <label style={{ gridColumn: "1/-1" }} className="form-group">
            <span>Notas</span>
            <textarea rows={3} value={form.notas ?? ""} onChange={(e) => set("notas", e.target.value || null)} placeholder="Observaciones..." />
          </label>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: 20, width: "100%" }} disabled={saving}>
          {saving ? "Guardando…" : isNew ? "Crear trayecto" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

// ── Badge estado ─────────────────────────────────────────────────────
function EstadoBadge({ estado, onClick }: { estado: string; onClick?: () => void }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    pagado:      { bg: "var(--accent-green-dim)",  fg: "var(--accent-green)" },
    pendiente:   { bg: "var(--accent-yellow-dim)", fg: "var(--accent-yellow)" },
    en_revision: { bg: "var(--accent-blue-dim)",   fg: "var(--accent-blue)" },
  };
  const c = colors[estado] ?? colors.pendiente;
  return (
    <span onClick={onClick} style={{
      padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.fg,
      cursor: onClick ? "pointer" : "default",
      userSelect: "none",
    }}>
      {estado}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function TrayectosPage() {
  const [rows, setRows] = useState<Trayecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Trayecto> | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [filterSem, setFilterSem] = useState<number | "">("");
  const [filterEst, setFilterEst] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const data = await getTrayectos(user.id);
    setRows(data as Trayecto[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (filterSem && r.semana !== filterSem) return false;
    if (filterEst && r.estado !== filterEst) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.origen?.toLowerCase().includes(q) ||
        r.destino?.toLowerCase().includes(q) ||
        r.factura?.toLowerCase().includes(q)
      );
    }
    return true;
  }), [rows, filterSem, filterEst, search]);

  const handleSave = useCallback(async (data: Partial<Trayecto>) => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    if (data.id) {
      await sb.from("cr_trayectos").update({ ...data, conductor_id: user.id }).eq("id", data.id);
    } else {
      await sb.from("cr_trayectos").insert({ ...data, conductor_id: user.id });
    }
    setModal(undefined);
    await load();
  }, []);

  const toggleEstado = useCallback(async (t: Trayecto) => {
    const next = t.estado === "pagado" ? "pendiente" : t.estado === "pendiente" ? "en_revision" : "pagado";
    const sb = createClient();
    await sb.from("cr_trayectos").update({ estado: next }).eq("id", t.id);
    setRows((prev) => prev.map((r) => r.id === t.id ? { ...r, estado: next } : r));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("¿Eliminar este trayecto?")) return;
    setDeleting(id);
    const sb = createClient();
    await sb.from("cr_trayectos").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  }, []);

  const total = filtered.reduce((s, r) => s + (r.valor ?? 0), 0);
  const totalExtras = filtered.reduce((s, r) => s + (r.extras ?? 0), 0);

  return (
    <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700 }}>Trayectos</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            {filtered.length} trayecto{filtered.length !== 1 ? "s" : ""} · {formatCurrency(total)} total
            {totalExtras > 0 ? ` · ${totalExtras}h extras` : ""}
          </p>
        </div>
        <button className="btn-primary" style={{ padding: "10px 18px", minHeight: 40 }}
          onClick={() => setModal(null)}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: "1 1 180px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            type="text" placeholder="Buscar origen, destino…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: 32, paddingRight: 12, height: 38,
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 10, color: "var(--text-primary)", fontSize: 13,
            }}
          />
        </div>
        <select value={filterSem} onChange={(e) => setFilterSem(e.target.value ? Number(e.target.value) : "")}
          style={{
            height: 38, padding: "0 12px",
            background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
            borderRadius: 10, color: "var(--text-primary)", fontSize: 13,
          }}>
          <option value="">Todas las semanas</option>
          {SEMANAS.map((s) => <option key={s} value={s}>Semana {s}</option>)}
        </select>
        <select value={filterEst} onChange={(e) => setFilterEst(e.target.value)}
          style={{
            height: 38, padding: "0 12px",
            background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
            borderRadius: 10, color: "var(--text-primary)", fontSize: 13,
          }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
          Cargando…
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <Navigation size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-secondary)" }}>No hay trayectos con esos filtros</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="tr-desktop">
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {["Fecha", "Sem.", "Origen → Destino", "Km", "Valor", "Extras", "Factura", "Estado", ""].map((h) => (
                      <th key={h} style={{
                        padding: "12px 14px", textAlign: "left",
                        fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--glass-border)" }}
                      className="tr-row">
                      <td style={{ padding: "12px 14px", fontSize: 13, whiteSpace: "nowrap" }}>{fmtFecha(t.fecha)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>S{t.semana}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13 }}>{t.origen} → {t.destino}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>{t.km ?? "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "var(--accent-green)", whiteSpace: "nowrap" }}>
                        {formatCurrency(t.valor)}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                        {t.extras ? `${t.extras}h` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-tertiary)" }}>{t.factura ?? "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <EstadoBadge estado={t.estado} onClick={() => toggleEstado(t)} />
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => setModal(t)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)", padding: 4, opacity: deleting === t.id ? 0.5 : 1 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="tr-mobile" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((t) => (
              <div key={t.id} className="glass-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.origen} → {t.destino}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                      {fmtFecha(t.fecha)} · Sem. {t.semana}{t.factura ? ` · #${t.factura}` : ""}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                      <EstadoBadge estado={t.estado} onClick={() => toggleEstado(t)} />
                      {t.extras ? <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.extras}h extras</span> : null}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent-green)" }}>
                      {formatCurrency(t.valor)}
                    </div>
                    {t.km ? <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{t.km} km</div> : null}
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 8 }}>
                      <button onClick={() => setModal(t)}
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: "var(--text-secondary)" }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        style={{ background: "var(--accent-red-dim)", border: "1px solid var(--accent-red)33", borderRadius: 8, padding: "5px 8px", cursor: "pointer", color: "var(--accent-red)" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FAB mobile */}
      <button className="fab-btn" onClick={() => setModal(null)}>
        <Plus size={22} />
      </button>

      {modal !== undefined && (
        <TrayectoModal
          trayecto={modal}
          onClose={() => setModal(undefined)}
          onSave={handleSave}
        />
      )}

      <style>{`
        .tr-desktop { display: block; }
        .tr-mobile  { display: none; }
        .tr-row:hover { background: var(--glass-bg); }
        .fab-btn {
          display: none;
          position: fixed; bottom: 80px; right: 20px; z-index: 40;
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--accent-green); color: #080C18;
          border: none; cursor: pointer; align-items: center; justify-content: center;
          box-shadow: var(--glow-green);
        }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group span { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea {
          background: var(--bg-elevated); border: 1px solid var(--glass-border);
          border-radius: 10px; padding: 10px 12px;
          color: var(--text-primary); font-size: 14px; font-family: inherit;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none; border-color: var(--accent-green);
        }
        .form-group select option { background: var(--bg-elevated); }
        @media (max-width: 768px) {
          .tr-desktop { display: none; }
          .tr-mobile  { display: flex; }
          .fab-btn    { display: flex; }
        }
      `}</style>
    </div>
  );
}
