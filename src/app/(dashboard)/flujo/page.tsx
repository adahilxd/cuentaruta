"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getFlujo, formatCurrency, fmtFecha } from "@/lib/supabase/queries";
import {
  CalendarDays, TrendingUp, Plus, X, Pencil, Trash2,
} from "lucide-react";

type FlujoRow = {
  id: string;
  semana: number;
  fecha_salida: string | null;
  fecha_ingreso: string | null;
  ingresos: number | null;
  salidas: number | null;
  obs: string | null;
  estado: string;
};

// ── Helpers ───────────────────────────────────────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    pagado:    { bg: "var(--accent-green-dim)",  fg: "var(--accent-green)" },
    pendiente: { bg: "var(--accent-yellow-dim)", fg: "var(--accent-yellow)" },
  };
  const c = map[estado] ?? map.pendiente;
  return (
    <span style={{ padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: c.bg, color: c.fg }}>
      {estado}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────
function FlujoModal({
  row, onClose, onSave,
}: {
  row: Partial<FlujoRow> | null;
  onClose: () => void;
  onSave: (data: Partial<FlujoRow>) => Promise<void>;
}) {
  const isNew = !row?.id;
  const [form, setForm] = useState<Partial<FlujoRow>>(
    row ?? { estado: "pendiente" }
  );
  const [saving, setSaving] = useState(false);

  function set(k: keyof FlujoRow, v: unknown) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--glass-border)", padding: 28,
          width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 18, fontWeight: 700 }}>
            {isNew ? "Nueva semana" : `Editar semana ${form.semana ?? ""}`}
          </h2>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label className="flj-field">
            <span>Semana #</span>
            <input
              type="number" min={1} max={53}
              value={form.semana ?? ""}
              onChange={(e) => set("semana", e.target.value ? Number(e.target.value) : undefined)}
              required placeholder="Ej. 14"
            />
          </label>
          <label className="flj-field">
            <span>Estado</span>
            <select value={form.estado ?? "pendiente"} onChange={(e) => set("estado", e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          </label>
          <label className="flj-field">
            <span>Fecha salida</span>
            <input
              type="date"
              value={form.fecha_salida ?? ""}
              onChange={(e) => set("fecha_salida", e.target.value || null)}
            />
          </label>
          <label className="flj-field">
            <span>Fecha ingreso</span>
            <input
              type="date"
              value={form.fecha_ingreso ?? ""}
              onChange={(e) => set("fecha_ingreso", e.target.value || null)}
            />
          </label>
          <label className="flj-field">
            <span>Ingresos (COP)</span>
            <input
              type="number" min={0}
              value={form.ingresos ?? ""}
              onChange={(e) => set("ingresos", e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
            />
          </label>
          <label className="flj-field">
            <span>Salidas (COP)</span>
            <input
              type="number" min={0}
              value={form.salidas ?? ""}
              onChange={(e) => set("salidas", e.target.value ? Number(e.target.value) : null)}
              placeholder="0"
            />
          </label>
          <label className="flj-field" style={{ gridColumn: "1/-1" }}>
            <span>Observaciones</span>
            <textarea
              rows={2}
              value={form.obs ?? ""}
              onChange={(e) => set("obs", e.target.value || null)}
              placeholder="Opcional"
            />
          </label>
        </div>

        {/* Utilidad preview */}
        {(form.ingresos !== undefined || form.salidas !== undefined) && (
          <div style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 10,
            background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Utilidad semana</span>
            <span style={{
              fontSize: 16, fontWeight: 700, fontFamily: "Sora, sans-serif",
              color: ((form.ingresos ?? 0) - (form.salidas ?? 0)) >= 0 ? "var(--accent-green)" : "var(--accent-red)",
            }}>
              {formatCurrency((form.ingresos ?? 0) - (form.salidas ?? 0))}
            </span>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: 20, width: "100%" }}
          disabled={saving}
        >
          {saving ? "Guardando…" : isNew ? "Crear semana" : "Guardar cambios"}
        </button>
      </form>

      <style>{`
        .flj-field { display: flex; flex-direction: column; gap: 6px; }
        .flj-field span { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
        .flj-field input, .flj-field select, .flj-field textarea {
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 10px 12px;
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
        }
        .flj-field input:focus, .flj-field select:focus, .flj-field textarea:focus {
          outline: none;
          border-color: var(--accent-green);
        }
      `}</style>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function FlujoPage() {
  const [flujo, setFlujo] = useState<FlujoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<FlujoRow> | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const data = await getFlujo(user.id);
    setFlujo(data as FlujoRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const totales = useMemo(() => ({
    ingresos: flujo.reduce((s, r) => s + (r.ingresos ?? 0), 0),
    salidas:  flujo.reduce((s, r) => s + (r.salidas ?? 0), 0),
  }), [flujo]);

  const utilidad = totales.ingresos - totales.salidas;

  const handleSave = useCallback(async (data: Partial<FlujoRow>) => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    if (data.id) {
      await sb.from("cr_flujo").update({ ...data, conductor_id: user.id }).eq("id", data.id);
    } else {
      await sb.from("cr_flujo").insert({ ...data, conductor_id: user.id });
    }
    setModal(undefined);
    await load();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("¿Eliminar esta semana?")) return;
    setDeleting(id);
    const sb = createClient();
    await sb.from("cr_flujo").delete().eq("id", id);
    setFlujo((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700 }}>Flujo Semanal</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            Ingresos y gastos por semana · {flujo.length} semana{flujo.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ padding: "10px 18px", minHeight: 44, whiteSpace: "nowrap" }}
          onClick={() => setModal(null)}
        >
          <Plus size={16} strokeWidth={2} /> Nueva semana
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total ingresos",  value: totales.ingresos, color: "var(--accent-green)",  icon: TrendingUp },
          { label: "Total salidas",   value: totales.salidas,  color: "var(--accent-red)",    icon: CalendarDays },
          { label: "Utilidad neta",   value: utilidad,         color: utilidad >= 0 ? "var(--accent-green)" : "var(--accent-red)", icon: TrendingUp },
        ].map((k) => (
          <div key={k.label} className="glass-card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora, sans-serif", color: k.color }}>
              {formatCurrency(k.value)}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>Cargando…</div>
      ) : flujo.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <CalendarDays size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} strokeWidth={1.5} />
          <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Sin semanas registradas</p>
          <button className="btn-primary" style={{ padding: "10px 24px", minHeight: 44 }} onClick={() => setModal(null)}>
            <Plus size={16} /> Registrar primera semana
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="flj-desktop">
            <div className="glass-card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    {["Sem.", "Salida", "Ingreso", "Ingresos", "Salidas", "Utilidad", "Estado", ""].map((h) => (
                      <th key={h} style={{
                        padding: "12px 14px", textAlign: "left",
                        fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)",
                        whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flujo.map((r) => {
                    const util = (r.ingresos ?? 0) - (r.salidas ?? 0);
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--glass-border)" }} className="flj-row">
                        <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "var(--accent-green)" }}>
                          S{r.semana}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                          {r.fecha_salida ? fmtFecha(r.fecha_salida) : "—"}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                          {r.fecha_ingreso ? fmtFecha(r.fecha_ingreso) : "—"}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "var(--accent-green)", whiteSpace: "nowrap" }}>
                          {formatCurrency(r.ingresos)}
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "var(--accent-red)", whiteSpace: "nowrap" }}>
                          {formatCurrency(r.salidas)}
                        </td>
                        <td style={{
                          padding: "12px 14px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                          color: util >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                        }}>
                          {formatCurrency(util)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <EstadoBadge estado={r.estado} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => setModal(r)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 6, borderRadius: 6 }}
                            >
                              <Pencil size={14} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deleting === r.id}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)", padding: 6, borderRadius: 6 }}
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Fila de totales */}
                  <tr style={{ borderTop: "2px solid var(--glass-border-hover)", background: "var(--glass-bg)" }}>
                    <td colSpan={3} style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>Total</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--accent-green)", whiteSpace: "nowrap" }}>
                      {formatCurrency(totales.ingresos)}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--accent-red)", whiteSpace: "nowrap" }}>
                      {formatCurrency(totales.salidas)}
                    </td>
                    <td style={{
                      padding: "12px 14px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                      color: utilidad >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                    }}>
                      {formatCurrency(utilidad)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="flj-mobile" style={{ display: "none", flexDirection: "column", gap: 10 }}>
            {flujo.map((r) => {
              const util = (r.ingresos ?? 0) - (r.salidas ?? 0);
              return (
                <div key={r.id} className="glass-card" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--accent-green)" }}>
                      Semana {r.semana}
                    </span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <EstadoBadge estado={r.estado} />
                      <button onClick={() => setModal(r)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4 }}>
                        <Pencil size={14} strokeWidth={1.5} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)", padding: 4 }}>
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Ingresos</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-green)" }}>
                        {formatCurrency(r.ingresos)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Salidas</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-red)" }}>
                        {formatCurrency(r.salidas)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Utilidad</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: util >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                        {formatCurrency(util)}
                      </div>
                    </div>
                    {(r.fecha_salida || r.fecha_ingreso) && (
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Período</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          {r.fecha_salida ? fmtFecha(r.fecha_salida) : "?"} → {r.fecha_ingreso ? fmtFecha(r.fecha_ingreso) : "?"}
                        </div>
                      </div>
                    )}
                  </div>
                  {r.obs && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>
                      {r.obs}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal */}
      {modal !== undefined && (
        <FlujoModal row={modal} onClose={() => setModal(undefined)} onSave={handleSave} />
      )}

      <style>{`
        .flj-row:hover { background: var(--glass-bg); }
        @media (max-width: 768px) {
          .flj-desktop { display: none; }
          .flj-mobile  { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
