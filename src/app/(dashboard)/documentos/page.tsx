"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getDocumentos, fmtFecha, estadoDocumento, diasParaVencer,
} from "@/lib/supabase/queries";
import {
  Plus, X, FileText, AlertCircle, AlertTriangle,
  CheckCircle2, Pencil, Trash2,
} from "lucide-react";

type Documento = {
  id: string; nombre: string;
  vencimiento: string | null;
  costo: number | null;
  notas: string | null;
};

const DOC_NOMBRES = [
  "SOAT", "Póliza RC", "Tarjeta de Operación", "Tecnomecánica",
  "Licencia de Conducción", "Revisión Bimestral", "Permiso de Ruta",
  "Seguro Carga", "Certificado de Pesos",
];

// ── Modal ─────────────────────────────────────────────────────────────
function DocModal({
  doc, onClose, onSave,
}: {
  doc: Partial<Documento> | null;
  onClose: () => void;
  onSave: (data: Partial<Documento>) => Promise<void>;
}) {
  const isNew = !doc?.id;
  const [form, setForm] = useState<Partial<Documento>>(doc ?? {});
  const [saving, setSaving] = useState(false);

  function set(k: keyof Documento, v: unknown) {
    setForm((p) => ({ ...p, [k]: v }));
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
        width: "100%", maxWidth: 440,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontSize: 18 }}>
            {isNew ? "Nuevo documento" : "Editar documento"}
          </h2>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="form-group">
            <span>Nombre del documento</span>
            <input list="doc-nombres" type="text" value={form.nombre ?? ""}
              onChange={(e) => set("nombre", e.target.value)} required placeholder="Ej. SOAT" />
            <datalist id="doc-nombres">
              {DOC_NOMBRES.map((n) => <option key={n} value={n} />)}
            </datalist>
          </label>
          <label className="form-group">
            <span>Fecha de vencimiento</span>
            <input type="date" value={form.vencimiento ?? ""}
              onChange={(e) => set("vencimiento", e.target.value || null)} />
          </label>
          <label className="form-group">
            <span>Costo (COP)</span>
            <input type="number" min={0} value={form.costo ?? ""}
              onChange={(e) => set("costo", e.target.value ? Number(e.target.value) : null)}
              placeholder="Opcional" />
          </label>
          <label className="form-group">
            <span>Notas</span>
            <textarea rows={2} value={form.notas ?? ""}
              onChange={(e) => set("notas", e.target.value || null)}
              placeholder="Opcional" />
          </label>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: 20, width: "100%" }} disabled={saving}>
          {saving ? "Guardando…" : isNew ? "Crear documento" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

// ── Card de documento ─────────────────────────────────────────────────
function DocCard({
  doc, onEdit, onDelete,
}: {
  doc: Documento;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const estado = estadoDocumento(doc.vencimiento);
  const dias = diasParaVencer(doc.vencimiento);

  const config = {
    vigente:     { color: "var(--accent-green)",  bg: "var(--accent-green-dim)",  Icon: CheckCircle2,  label: "Vigente" },
    vence_pronto:{ color: "var(--accent-yellow)", bg: "var(--accent-yellow-dim)", Icon: AlertTriangle, label: "Vence pronto" },
    vencido:     { color: "var(--accent-red)",    bg: "var(--accent-red-dim)",    Icon: AlertCircle,   label: "Vencido" },
  }[estado];

  const { color, bg, Icon, label } = config;

  return (
    <div className="glass-card" style={{
      padding: "18px 20px",
      border: `1px solid ${estado !== "vigente" ? `${color}44` : "var(--glass-border)"}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color, borderRadius: "4px 0 0 4px" }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{doc.nombre}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 8, background: bg, fontSize: 11, fontWeight: 600, color }}>
              <Icon size={11} />
              {label}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginLeft: 12 }}>
            <button onClick={onEdit}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 6 }}>
              <Pencil size={14} />
            </button>
            <button onClick={onDelete}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red)", padding: 6 }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
          {doc.vencimiento && (
            <div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 2 }}>Vencimiento</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtFecha(doc.vencimiento)}</div>
            </div>
          )}
          {dias !== null && (
            <div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 2 }}>
                {dias >= 0 ? "Días restantes" : "Días vencido"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color }}>
                {Math.abs(dias)} días
              </div>
            </div>
          )}
          {doc.costo && (
            <div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 2 }}>Costo</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(doc.costo)}
              </div>
            </div>
          )}
        </div>
        {doc.notas && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary)" }}>{doc.notas}</div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function DocumentosPage() {
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Documento> | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const data = await getDocumentos(user.id);
    setDocs(data as Documento[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleSave = useCallback(async (data: Partial<Documento>) => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    if (data.id) {
      await sb.from("cr_documentos").update({ ...data, conductor_id: user.id }).eq("id", data.id);
    } else {
      await sb.from("cr_documentos").insert({ ...data, conductor_id: user.id });
    }
    setModal(undefined);
    await load();
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("¿Eliminar este documento?")) return;
    setDeleting(id);
    const sb = createClient();
    await sb.from("cr_documentos").delete().eq("id", id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setDeleting(null);
  }, []);

  const alertas = docs.filter((d) => estadoDocumento(d.vencimiento) !== "vigente");
  const vigentes = docs.filter((d) => estadoDocumento(d.vencimiento) === "vigente");

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700 }}>Documentos</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            {docs.length} documento{docs.length !== 1 ? "s" : ""}
            {alertas.length > 0 ? ` · ${alertas.length} con alertas` : " · todos vigentes"}
          </p>
        </div>
        <button className="btn-primary" style={{ padding: "10px 18px", minHeight: 40 }}
          onClick={() => setModal(null)}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>Cargando…</div>
      ) : docs.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <FileText size={32} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Sin documentos registrados</p>
        </div>
      ) : (
        <>
          {alertas.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Requieren atención
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {alertas.map((d) => (
                  <DocCard key={d.id} doc={d}
                    onEdit={() => setModal(d)}
                    onDelete={() => handleDelete(d.id)} />
                ))}
              </div>
            </div>
          )}
          {vigentes.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Vigentes
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {vigentes.map((d) => (
                  <DocCard key={d.id} doc={d}
                    onEdit={() => setModal(d)}
                    onDelete={() => handleDelete(d.id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modal !== undefined && (
        <DocModal doc={modal} onClose={() => setModal(undefined)} onSave={handleSave} />
      )}

      <style>{`
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
      `}</style>
    </div>
  );
}
