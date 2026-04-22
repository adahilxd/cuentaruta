"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getViaticos, formatCurrency, fmtFecha } from "@/lib/supabase/queries";
import { Plus, X, Search, Wallet, Pencil, Trash2 } from "lucide-react";

type Viatico = {
  id: string; fecha: string; semana: number;
  categoria: string; descripcion: string | null;
  monto: number | null; tipo_pago: string;
};

const CATEGORIAS = [
  "ACPM", "Peaje", "Alimentacion", "Hotel",
  "Mantenimiento", "AdBlue", "Lavada", "Montallantas", "Otro",
];
const TIPOS_PAGO = ["efectivo", "tarjeta", "flypass"];
const SEMANAS = Array.from({ length: 15 }, (_, i) => i + 1);

const CAT_COLOR: Record<string, string> = {
  ACPM:          "var(--accent-blue)",
  Peaje:         "var(--accent-yellow)",
  Alimentacion:  "var(--accent-green)",
  Hotel:         "#AA88FF",
  Mantenimiento: "var(--accent-red)",
  AdBlue:        "#44DDFF",
  Lavada:        "#22CCAA",
  Montallantas:  "#FF8844",
  Otro:          "var(--text-secondary)",
};

// ── Modal ─────────────────────────────────────────────────────────────
function ViaticoModal({
  viatico, onClose, onSave,
}: {
  viatico: Partial<Viatico> | null;
  onClose: () => void;
  onSave: (data: Partial<Viatico>) => Promise<void>;
}) {
  const isNew = !viatico?.id;
  const [form, setForm] = useState<Partial<Viatico>>(
    viatico ?? {
      tipo_pago: "efectivo",
      fecha: new Date().toISOString().slice(0, 10),
    }
  );
  const [saving, setSaving] = useState(false);

  function set(k: keyof Viatico, v: unknown) {
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
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--glass-border)", padding: 28,
        width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 18 }}>
            {isNew ? "Nuevo viático" : "Editar viático"}
          </h2>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label className="form-group">
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
            <span>Categoría</span>
            <select value={form.categoria ?? ""} onChange={(e) => set("categoria", e.target.value)} required>
              <option value="">Seleccionar</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="form-group">
            <span>Tipo de pago</span>
            <select value={form.tipo_pago ?? "efectivo"} onChange={(e) => set("tipo_pago", e.target.value)}>
              {TIPOS_PAGO.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={{ gridColumn: "1/-1" }} className="form-group">
            <span>Monto (COP)</span>
            <input type="number" min={0} value={form.monto ?? ""}
              onChange={(e) => set("monto", e.target.value ? Number(e.target.value) : null)}
              placeholder="0" required />
          </label>
          <label style={{ gridColumn: "1/-1" }} className="form-group">
            <span>Descripción</span>
            <input type="text" value={form.descripcion ?? ""}
              onChange={(e) => set("descripcion", e.target.value || null)}
              placeholder="Opcional" />
          </label>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: 20, width: "100%" }} disabled={saving}>
          {saving ? "Guardando…" : isNew ? "Crear viático" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

// ── Horizontal bar chart por categoría ──────────────────────────────
function CatChart({ data }: { data: { cat: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d) => (
        <div key={d.cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 96, fontSize: 12, color: "var(--text-secondary)", flexShrink: 0 }}>{d.cat}</div>
          <div style={{ flex: 1, height: 10, background: "var(--glass-bg)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 6,
              background: CAT_COLOR[d.cat] ?? "var(--text-secondary)",
              width: `${(d.total / max) * 100}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ width: 90, textAlign: "right", fontSize: 12, fontWeight: 600, color: CAT_COLOR[d.cat] ?? "var(--text-secondary)", flexShrink: 0 }}>
            {formatCurrency(d.total)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function ViaticosPage() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Viatico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Viatico> | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [filterSem, setFilterSem] = useState<number | "">("");
  const [filterCat, setFilterCat] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Sync concepto filter from URL params (sidebar/chips navigation)
  useEffect(() => {
    setFilterCat(searchParams.get("concepto") ?? "");
  }, [searchParams]);

  async function load() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const data = await getViaticos(user.id);
    setRows(data as Viatico[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (filterSem && r.semana !== filterSem) return false;
    if (filterCat && r.categoria !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.descripcion?.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q);
    }
    return true;
  }), [rows, filterSem, filterCat, search]);

  const byTipo = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((r) => { m[r.tipo_pago] = (m[r.tipo_pago] ?? 0) + (r.monto ?? 0); });
    return m;
  }, [rows]);

  const byCategoria = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((r) => { m[r.categoria] = (m[r.categoria] ?? 0) + (r.monto ?? 0); });
    return Object.entries(m)
      .map(([cat, total]) => ({ cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [rows]);

  const handleSave = useCallback(async (data: Partial<Viatico>) => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    if (data.id) {
      await sb.from("cr_viaticos").update({ ...data, conductor_id: user.id }).eq("id", data.id);
    } else {
      await sb.from("cr_viaticos").insert({ ...data, conductor_id: user.id });
    }
    setModal(undefined);
    await load();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("¿Eliminar este viático?")) return;
    setDeleting(id);
    const sb = createClient();
    await sb.from("cr_viaticos").delete().eq("id", id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  }, []);

  const totalFiltrado = filtered.reduce((s, r) => s + (r.monto ?? 0), 0);

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700 }}>Viáticos</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""} · {formatCurrency(totalFiltrado)}
          </p>
        </div>
        <button className="btn-primary" style={{ padding: "10px 18px", minHeight: 40 }}
          onClick={() => setModal(null)}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Resumen */}
      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Por tipo de pago */}
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Por tipo de pago</div>
            {Object.entries(byTipo).map(([tipo, monto]) => (
              <div key={tipo} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{tipo}</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(monto)}</span>
              </div>
            ))}
          </div>
          {/* Por categoría */}
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Por categoría</div>
            <CatChart data={byCategoria.slice(0, 6)} />
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ position: "relative", flex: "1 1 180px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input type="text" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", paddingLeft: 32, paddingRight: 12, height: 38,
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: 10, color: "var(--text-primary)", fontSize: 13,
            }} />
        </div>
        <select value={filterSem} onChange={(e) => setFilterSem(e.target.value ? Number(e.target.value) : "")}
          style={{ height: 38, padding: "0 12px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}>
          <option value="">Todas las semanas</option>
          {SEMANAS.map((s) => <option key={s} value={s}>Semana {s}</option>)}
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          style={{ height: 38, padding: "0 12px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>Cargando…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <Wallet size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Sin viáticos registrados</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((v) => (
            <div key={v.id} className="glass-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 10, flexShrink: 0, alignSelf: "stretch", borderRadius: 4,
                background: CAT_COLOR[v.categoria] ?? "var(--text-secondary)",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v.categoria}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>
                  {fmtFecha(v.fecha)} · Sem. {v.semana} · {v.tipo_pago}
                  {v.descripcion ? ` · ${v.descripcion}` : ""}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: CAT_COLOR[v.categoria] ?? "var(--text-primary)", whiteSpace: "nowrap" }}>
                {formatCurrency(v.monto)}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setModal(v)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 6 }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)", padding: 6, opacity: deleting === v.id ? 0.5 : 1 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab-btn" onClick={() => setModal(null)}>
        <Plus size={22} />
      </button>

      {modal !== undefined && (
        <ViaticoModal viatico={modal} onClose={() => setModal(undefined)} onSave={handleSave} />
      )}

      <style>{`
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
        .form-group input:focus, .form-group select:focus {
          outline: none; border-color: var(--accent-green);
        }
        .form-group select option { background: var(--bg-elevated); }
        @media (max-width: 640px) {
          .fab-btn { display: flex; }
        }
      `}</style>
    </div>
  );
}
