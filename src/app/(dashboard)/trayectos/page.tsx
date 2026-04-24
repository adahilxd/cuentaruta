"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getTrayectos, formatCurrency, fmtFecha, isoWeekOfYear } from "@/lib/supabase/queries";
import {
  Plus, X, Search, Camera,
  Navigation, Pencil, Trash2,
} from "lucide-react";

type Trayecto = {
  id: string; fecha: string; semana: number;
  cliente: string | null;
  origen: string | null; destino: string | null;
  km_ini: number | null; km_fin: number | null; km: number | null;
  foto_ini_url: string | null; foto_fin_url: string | null;
  h_inicio: string | null; h_fin: string | null; h_cobrar: number | null;
  valor: number | null; extras: number | null;
  estado: string; factura: string | null; notas: string | null; motivo_rechazo: string | null;
};

const SEMANAS = Array.from({ length: 15 }, (_, i) => i + 1);
const ESTADOS = ["pendiente", "pagado", "en_revision", "aprobado", "rechazado"];

// ── Helpers de estilo modal (estilo conductor.milavad) ───────────────
const INP: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  background: "rgba(255,255,255,0.04)", border: "1px solid #21262D",
  color: "#E6EDF3", fontSize: 13, fontFamily: "inherit",
  boxSizing: "border-box" as const,
};
const LBL_S: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: "#8B949E", textTransform: "uppercase" as const,
  letterSpacing: "0.08em", marginBottom: 4,
};

// ── Modal de formulario ───────────────────────────────────────────────
function TrayectoModal({
  trayecto, conductorId, onClose, onSave,
}: {
  trayecto: Partial<Trayecto> | null;
  conductorId: string;
  onClose: () => void;
  onSave: (data: Partial<Trayecto>) => Promise<void>;
}) {
  const isNew = !trayecto?.id;
  const hoy = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    fecha:      trayecto?.fecha      ?? hoy,
    cliente:    trayecto?.cliente    ?? "",
    km_ini:     trayecto?.km_ini?.toString()  ?? "",
    km_fin:     trayecto?.km_fin?.toString()  ?? "",
    foto_ini_url: trayecto?.foto_ini_url ?? null as string | null,
    foto_fin_url: trayecto?.foto_fin_url ?? null as string | null,
    h_inicio:   trayecto?.h_inicio   ?? "",
    h_fin:      trayecto?.h_fin      ?? "",
    h_cobrar:   trayecto?.h_cobrar?.toString() ?? "",
    extras:     trayecto?.extras?.toString()   ?? "0",
    valor:      trayecto?.valor?.toString()    ?? "",
    factura:    trayecto?.factura    ?? "",
    origen:     trayecto?.origen     ?? "",
    estado:     trayecto?.estado     ?? "pendiente",
    notas:      trayecto?.notas      ?? "",
  });
  const [saving, setSaving]         = useState(false);
  const [uploadingIni, setUpIni]    = useState(false);
  const [uploadingFin, setUpFin]    = useState(false);
  const fileIniRef = useRef<HTMLInputElement>(null);
  const fileFinRef = useRef<HTMLInputElement>(null);

  const kmIni   = form.km_ini ? parseFloat(form.km_ini) : null;
  const kmFin   = form.km_fin ? parseFloat(form.km_fin) : null;
  const kmTotal = kmIni !== null && kmFin !== null && kmFin > kmIni ? kmFin - kmIni : null;

  function calcHoras() {
    if (!form.h_inicio || !form.h_fin) return "";
    const [h1, m1] = form.h_inicio.split(":").map(Number);
    const [h2, m2] = form.h_fin.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? (diff / 60).toFixed(2) : "";
  }

  async function uploadFoto(file: File, tipo: "inicio" | "fin") {
    const sb  = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${conductorId}/${form.fecha ?? "sin-fecha"}/${tipo}_${Date.now()}.${ext}`;
    tipo === "inicio" ? setUpIni(true) : setUpFin(true);
    const { error } = await sb.storage.from("odometros").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = sb.storage.from("odometros").getPublicUrl(path);
      setForm(f => ({ ...f, [tipo === "inicio" ? "foto_ini_url" : "foto_fin_url"]: data.publicUrl }));
    }
    tipo === "inicio" ? setUpIni(false) : setUpFin(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const horasCalc  = parseFloat(calcHoras() || "0") || null;
    const semana     = isoWeekOfYear(new Date(form.fecha + "T12:00:00"));
    await onSave({
      ...(trayecto?.id ? { id: trayecto.id } : {}),
      fecha:        form.fecha,
      semana,
      cliente:      form.cliente  || null,
      km_ini:       kmIni,
      km_fin:       kmFin,
      km:           kmTotal,
      foto_ini_url: form.foto_ini_url,
      foto_fin_url: form.foto_fin_url,
      h_inicio:     form.h_inicio || null,
      h_fin:        form.h_fin    || null,
      h_cobrar:     form.h_cobrar ? parseFloat(form.h_cobrar) : horasCalc,
      extras:       parseFloat(form.extras) || 0,
      valor:        form.valor ? parseInt(form.valor.replace(/\D/g, "")) : null,
      factura:      form.factura  || null,
      origen:       form.origen   || null,
      estado:       form.estado,
      notas:        form.notas    || null,
    });
    setSaving(false);
  }

  const horasCalc = calcHoras();

  const fotoStyle = (url: string | null): React.CSSProperties => ({
    width: "100%", padding: "10px 8px", borderRadius: 8, cursor: "pointer",
    fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: `1px solid ${url ? "rgba(63,185,80,.3)" : "rgba(240,180,41,.25)"}`,
    background: url ? "rgba(63,185,80,.08)" : "rgba(240,180,41,.06)",
    color: url ? "#3FB950" : "#F0B429",
    transition: "all .15s",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }} onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}
        style={{
          background: "#161B22", border: "1px solid #21262D", borderRadius: 16,
          padding: 24, width: "100%", maxWidth: 520,
          maxHeight: "92vh", overflowY: "auto",
        }}>

        <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: "#E6EDF3" }}>
          {isNew ? "Nuevo trayecto" : "Editar trayecto"}
        </h2>

        {/* FECHA + CLIENTE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={LBL_S}>Fecha *</label>
            <input type="date" value={form.fecha}
              onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              style={INP} required />
          </div>
          <div>
            <label style={LBL_S}>Cliente</label>
            <input type="text" value={form.cliente}
              onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}
              placeholder="CHEC, EPM…" style={INP} />
          </div>
        </div>

        {/* ODÓMETRO */}
        <div style={{ marginBottom: 12 }}>
          <label style={LBL_S}>Odómetro</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
            <div>
              <label style={{ ...LBL_S, color: "#6E7681" }}>KM inicial</label>
              <input type="number" value={form.km_ini}
                onChange={e => setForm(f => ({ ...f, km_ini: e.target.value }))}
                placeholder="0" style={{ ...INP, fontFamily: "monospace" }} />
            </div>
            <div>
              <label style={{ ...LBL_S, color: "#6E7681" }}>KM final</label>
              <input type="number" value={form.km_fin}
                onChange={e => setForm(f => ({ ...f, km_fin: e.target.value }))}
                placeholder="0" style={{ ...INP, fontFamily: "monospace" }} />
            </div>
          </div>

          {/* Foto botones */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <input ref={fileIniRef} type="file" accept="image/*" capture="environment"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f, "inicio"); }} />
              <button type="button" onClick={() => fileIniRef.current?.click()}
                disabled={uploadingIni} style={fotoStyle(form.foto_ini_url)}>
                <span style={{ fontSize: 15 }}>{uploadingIni ? "⏳" : form.foto_ini_url ? "✅" : "📷"}</span>
                {uploadingIni ? "Subiendo…" : form.foto_ini_url ? "Inicio ✓" : "Foto inicio"}
              </button>
              {form.foto_ini_url && (
                <img src={form.foto_ini_url} alt="inicio"
                  style={{ width: "100%", height: 52, objectFit: "cover", borderRadius: 6, marginTop: 4 }} />
              )}
            </div>
            <div>
              <input ref={fileFinRef} type="file" accept="image/*" capture="environment"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f, "fin"); }} />
              <button type="button" onClick={() => fileFinRef.current?.click()}
                disabled={uploadingFin} style={fotoStyle(form.foto_fin_url)}>
                <span style={{ fontSize: 15 }}>{uploadingFin ? "⏳" : form.foto_fin_url ? "✅" : "📷"}</span>
                {uploadingFin ? "Subiendo…" : form.foto_fin_url ? "Fin ✓" : "Foto fin"}
              </button>
              {form.foto_fin_url && (
                <img src={form.foto_fin_url} alt="fin"
                  style={{ width: "100%", height: 52, objectFit: "cover", borderRadius: 6, marginTop: 4 }} />
              )}
            </div>
          </div>

          {/* Total recorrido */}
          {kmTotal !== null && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 4,
              background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.3)",
              color: "#00E676", fontWeight: 700, fontSize: 18,
              fontFamily: "Sora, sans-serif",
            }}>
              📍 {kmTotal} km recorridos
            </div>
          )}
        </div>

        {/* H. INICIO + H. FIN + H. EXTRAS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={LBL_S}>H. Inicio</label>
            <input type="time" value={form.h_inicio}
              onChange={e => setForm(f => ({ ...f, h_inicio: e.target.value }))}
              style={{ ...INP, fontFamily: "monospace" }} />
          </div>
          <div>
            <label style={LBL_S}>H. Fin</label>
            <input type="time" value={form.h_fin}
              onChange={e => setForm(f => ({ ...f, h_fin: e.target.value }))}
              style={{ ...INP, fontFamily: "monospace" }} />
          </div>
          <div>
            <label style={LBL_S}>H. Extras</label>
            <input type="number" value={form.extras} min={0} step={0.5}
              onChange={e => setForm(f => ({ ...f, extras: e.target.value }))}
              placeholder="0" style={{ ...INP, fontFamily: "monospace" }} />
          </div>
        </div>

        {/* Horas calculadas (indicador) */}
        {horasCalc && (
          <div style={{
            marginBottom: 12, padding: "7px 12px",
            background: "rgba(240,180,41,.08)", border: "1px solid rgba(240,180,41,.2)",
            borderRadius: 8, fontSize: 12, color: "#F0B429",
          }}>
            ⏱️ Horas calculadas: <span style={{ fontFamily: "monospace" }}>{horasCalc}h</span>
          </div>
        )}

        {/* H. A COBRAR */}
        <div style={{ marginBottom: 12 }}>
          <label style={LBL_S}>H. a cobrar</label>
          <input type="number" value={form.h_cobrar} min={0} step={0.5}
            onChange={e => setForm(f => ({ ...f, h_cobrar: e.target.value }))}
            placeholder={horasCalc || "0"} style={{ ...INP, fontFamily: "monospace" }} />
        </div>

        {/* VALOR + FACTURA */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={LBL_S}>Valor ($)</label>
            <input type="text" value={form.valor}
              onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
              placeholder="250000" style={{ ...INP, fontFamily: "monospace" }} />
          </div>
          <div>
            <label style={LBL_S}>N° Factura</label>
            <input type="text" value={form.factura}
              onChange={e => setForm(f => ({ ...f, factura: e.target.value }))}
              placeholder="FAC-001" style={INP} />
          </div>
        </div>

        {/* RUTA */}
        <div style={{ marginBottom: 12 }}>
          <label style={LBL_S}>Ruta</label>
          <input type="text" value={form.origen}
            onChange={e => setForm(f => ({ ...f, origen: e.target.value }))}
            placeholder="Manizales → La Dorada" style={INP} />
        </div>

        {/* ESTADO */}
        <div style={{ marginBottom: 12 }}>
          <label style={LBL_S}>Estado</label>
          <select value={form.estado}
            onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
            style={{ ...INP, appearance: "none" as const }}>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="en_revision">En revisión</option>
          </select>
        </div>

        {/* NOTAS */}
        <div style={{ marginBottom: 20 }}>
          <label style={LBL_S}>Notas</label>
          <input type="text" value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
            placeholder="Observaciones…" style={INP} />
        </div>

        {/* BOTONES */}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, background: "transparent", border: "1px solid #21262D",
            color: "#8B949E", padding: 10, borderRadius: 8,
            cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: 13,
          }}>Cancelar</button>
          <button type="submit" disabled={saving || uploadingIni || uploadingFin} style={{
            flex: 2, padding: 10, borderRadius: 8, border: "none",
            background: "linear-gradient(135deg, #F0B429 0%, #E88C00 100%)",
            color: "#080C18", fontWeight: 800, fontSize: 14,
            fontFamily: "Sora, sans-serif",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Guardando…" : (uploadingIni || uploadingFin) ? "Subiendo fotos…" : isNew ? "Guardar trayecto" : "Guardar cambios"}
          </button>
        </div>
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
    aprobado:    { bg: "rgba(0,230,118,0.12)",      fg: "#00E676" },
    rechazado:   { bg: "rgba(255,68,68,0.12)",      fg: "#FF4444" },
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
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Trayecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Trayecto> | null | undefined>(undefined);
  const [conductorId, setConductorId] = useState("");
  const [tieneContratista, setTieneContratista] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSem, setFilterSem] = useState<number | "">("");
  const [filterEst, setFilterEst] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Sync filters from URL params (sidebar/chips navigation)
  useEffect(() => {
    const estado = searchParams.get("estado") ?? "";
    const semana = searchParams.get("semana");
    setFilterEst(estado);
    setFilterSem(semana ? Number(semana) : "");
  }, [searchParams]);

  async function load() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    setConductorId(user.id);
    const [trayData, perfilData] = await Promise.all([
      getTrayectos(user.id),
      sb.from("cr_usuarios").select("contratista_id").eq("id", user.id).single(),
    ]);
    setRows(trayData as Trayecto[]);
    setTieneContratista(!!perfilData.data?.contratista_id);
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
    // Si el conductor tiene contratista asignado, solo el contratista puede cambiar el estado
    if (tieneContratista) return;
    const next = t.estado === "pagado" ? "pendiente" : t.estado === "pendiente" ? "en_revision" : "pagado";
    const sb = createClient();
    await sb.from("cr_trayectos").update({ estado: next }).eq("id", t.id);
    setRows((prev) => prev.map((r) => r.id === t.id ? { ...r, estado: next } : r));
  }, [tieneContratista]);

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
                        <EstadoBadge estado={t.estado} onClick={tieneContratista ? undefined : () => toggleEstado(t)} />
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
                    <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <EstadoBadge estado={t.estado} onClick={tieneContratista ? undefined : () => toggleEstado(t)} />
                      {t.extras ? <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.extras}h extras</span> : null}
                    </div>
                    {t.estado === "rechazado" && t.motivo_rechazo && (
                      <p style={{ fontSize: 11, color: "#FF4444", margin: "4px 0 0", fontStyle: "italic" }}>Motivo: {t.motivo_rechazo}</p>
                    )}
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
          conductorId={conductorId}
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
