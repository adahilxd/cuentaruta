"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, Clock, CheckCircle, XCircle, Send, FileText, Download, Bell } from "lucide-react";

interface Conductor {
  id: string;
  nombre: string;
  telefono: string;
  placa: string;
  created_at: string;
}

interface Invitacion {
  id: string;
  email: string;
  estado: string;
  created_at: string;
  expires_at: string;
}

interface TrayectoPendiente {
  id: string;
  conductor_id: string;
  fecha: string;
  origen: string;
  destino: string;
  km: number;
  valor: number;
  estado: string;
  cr_usuarios: { nombre: string } | null;
}

interface ViaticoPendiente {
  id: string;
  conductor_id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  estado: string;
  cr_usuarios: { nombre: string } | null;
}

type Tab = "overview" | "conductores" | "trayectos" | "viaticos" | "invitaciones";

export default function ContratistaPage() {
  const sb = createClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [trayectos, setTrayectos] = useState<TrayectoPendiente[]>([]);
  const [viaticos, setViaticos] = useState<ViaticoPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [invEmail, setInvEmail] = useState("");
  const [invSending, setInvSending] = useState(false);
  const [invMsg, setInvMsg] = useState("");
  const [motivoModal, setMotivoModal] = useState<{ tipo: "trayecto" | "viatico"; id: string } | null>(null);
  const [motivoText, setMotivoText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    // 1. Conductores + invitaciones en paralelo
    const [condRes, invRes] = await Promise.all([
      sb.from("cr_usuarios").select("id, nombre, telefono, placa, created_at")
        .eq("contratista_id", user.id).eq("rol", "conductor"),
      sb.from("cr_invitaciones").select("id, email, estado, created_at, expires_at")
        .eq("contratista_id", user.id).order("created_at", { ascending: false }),
    ]);

    const conductorIds = (condRes.data ?? []).map(c => c.id);
    setConductores((condRes.data ?? []) as Conductor[]);
    setInvitaciones((invRes.data ?? []) as Invitacion[]);

    // 2. Trayectos y viáticos solo si hay conductores vinculados
    if (conductorIds.length === 0) {
      setTrayectos([]);
      setViaticos([]);
      setLoading(false);
      return;
    }

    const [trayRes, viaRes] = await Promise.all([
      sb.from("cr_trayectos")
        .select("id, conductor_id, fecha, origen, destino, km, valor, estado, cr_usuarios!conductor_id(nombre)")
        .in("conductor_id", conductorIds)
        .in("estado", ["pendiente", "en_revision"])
        .order("fecha", { ascending: false }),
      sb.from("cr_viaticos")
        .select("id, conductor_id, fecha, categoria, descripcion, monto, estado, cr_usuarios!conductor_id(nombre)")
        .in("conductor_id", conductorIds)
        .eq("estado", "pendiente")
        .order("fecha", { ascending: false }),
    ]);

    console.log("[contratista load] conductorIds:", conductorIds, "trayectos:", trayRes.data?.length ?? 0, trayRes.error, "viaticos:", viaRes.data?.length ?? 0, viaRes.error);

    setTrayectos((trayRes.data ?? []) as unknown as TrayectoPendiente[]);
    setViaticos((viaRes.data ?? []) as unknown as ViaticoPendiente[]);
    setLoading(false);
  }, [sb]);

  useEffect(() => { load(); }, [load]);

  async function sendInvitacion() {
    if (!invEmail.trim()) return;
    setInvSending(true); setInvMsg("");
    const res = await fetch("/api/invitaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: invEmail.trim() }),
    });
    const d = await res.json();
    if (res.ok) { setInvMsg("✅ Invitación enviada"); setInvEmail(""); load(); }
    else setInvMsg(`❌ ${d.error}`);
    setInvSending(false);
  }

  async function marcarEnRevision(id: string) {
    const res = await fetch(`/api/contratista/trayectos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en_revision" }),
    });
    if (!res.ok) { const d = await res.json(); console.error("[marcarEnRevision]", d.error); }
    load();
  }

  async function aprobarTrayecto(id: string) {
    const res = await fetch(`/api/contratista/trayectos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "aprobado" }),
    });
    if (!res.ok) { const d = await res.json(); console.error("[aprobarTrayecto]", d.error); }
    load();
  }

  async function rechazarTrayecto(id: string, motivo: string) {
    const res = await fetch(`/api/contratista/trayectos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "rechazado", motivo_rechazo: motivo }),
    });
    if (!res.ok) { const d = await res.json(); console.error("[rechazarTrayecto]", d.error); }
    load();
  }

  async function aprobarViatico(id: string) {
    const res = await fetch(`/api/contratista/viaticos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "aprobado" }),
    });
    if (!res.ok) { const d = await res.json(); console.error("[aprobarViatico]", d.error); }
    load();
  }

  async function rechazarViatico(id: string, motivo: string) {
    const res = await fetch(`/api/contratista/viaticos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "rechazado", motivo_rechazo: motivo }),
    });
    if (!res.ok) { const d = await res.json(); console.error("[rechazarViatico]", d.error); }
    load();
  }

  function handleRechazo() {
    if (!motivoModal || !motivoText.trim()) return;
    if (motivoModal.tipo === "trayecto") rechazarTrayecto(motivoModal.id, motivoText);
    else rechazarViatico(motivoModal.id, motivoText);
    setMotivoModal(null); setMotivoText("");
  }

  async function descargarReporte(formato: "excel" | "pdf") {
    const res = await fetch(`/api/reportes?formato=${formato}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_flota.${formato === "excel" ? "xlsx" : "pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pendCount = trayectos.length + viaticos.length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: "Resumen" },
    { id: "conductores", label: "Conductores", badge: conductores.length },
    { id: "trayectos", label: "Trayectos", badge: trayectos.length },
    { id: "viaticos", label: "Viáticos", badge: viaticos.length },
    { id: "invitaciones", label: "Invitaciones" },
  ];

  const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ padding: "24px 20px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700, margin: 0 }}>Panel Contratista</h1>
          {pendCount > 0 && (
            <p style={{ color: "#FFD600", fontFamily: "DM Sans, sans-serif", fontSize: 13, margin: "4px 0 0" }}>
              {pendCount} item{pendCount !== 1 ? "s" : ""} pendiente{pendCount !== 1 ? "s" : ""} de aprobación
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => descargarReporte("excel")} style={btnSecStyle}>
            <Download size={14} strokeWidth={1.5} /> Excel
          </button>
          <button onClick={() => descargarReporte("pdf")} style={btnSecStyle}>
            <FileText size={14} strokeWidth={1.5} /> PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px",
            background: "none",
            border: "none",
            borderBottom: tab === t.id ? "2px solid #FFD600" : "2px solid transparent",
            color: tab === t.id ? "#FFD600" : "rgba(255,255,255,0.5)",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            fontWeight: tab === t.id ? 700 : 400,
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: -1,
          }}>
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span style={{ background: t.id === "trayectos" || t.id === "viaticos" ? "#FF4444" : "rgba(255,255,255,0.15)", color: t.id === "trayectos" || t.id === "viaticos" ? "#fff" : "rgba(255,255,255,0.7)", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif" }}>Cargando…</p>
      ) : (
        <>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
              {[
                { label: "Conductores", value: conductores.length, icon: Users, color: "#00E676" },
                { label: "Pend. aprobación", value: pendCount, icon: Clock, color: "#FFD600" },
                { label: "Tray. pendientes", value: trayectos.length, icon: Clock, color: "#FFD600" },
                { label: "Viát. pendientes", value: viaticos.length, icon: Clock, color: "#FFD600" },
              ].map(card => (
                <div key={card.label} style={cardStyle}>
                  <card.icon size={20} strokeWidth={1.5} color={card.color} />
                  <div style={{ marginTop: 12 }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif", fontSize: 12, margin: "0 0 4px" }}>{card.label}</p>
                    <p style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONDUCTORES */}
          {tab === "conductores" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {conductores.length === 0 && <p style={emptyStyle}>No tienes conductores aún. Invita uno desde la pestaña Invitaciones.</p>}
              {conductores.map(c => (
                <div key={c.id} style={rowStyle}>
                  <div style={{ width: 40, height: 40, borderRadius: 99, background: "#00E676", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#080C18", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 16 }}>{c.nombre?.[0]?.toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600, margin: "0 0 2px" }}>{c.nombre}</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: 13, margin: 0 }}>{c.placa} · {c.telefono}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TRAYECTOS */}
          {tab === "trayectos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {trayectos.length === 0 && <p style={emptyStyle}>No hay trayectos pendientes de revisión.</p>}
              {trayectos.map(t => (
                <div key={t.id} style={rowStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <p style={{ color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600, margin: 0 }}>
                        {t.origen} → {t.destino}
                      </p>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                        background: t.estado === "pendiente" ? "rgba(255,214,0,0.15)" : "rgba(99,179,237,0.15)",
                        color: t.estado === "pendiente" ? "#FFD600" : "#63B3ED",
                        fontFamily: "DM Sans, sans-serif",
                      }}>
                        {t.estado === "pendiente" ? "Pendiente" : "En revisión"}
                      </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: 13, margin: "0 0 2px" }}>
                      {t.fecha} · {t.km} km · {fmt(t.valor)}
                    </p>
                    <p style={{ color: "#FFD600", fontFamily: "DM Sans, sans-serif", fontSize: 12, margin: 0 }}>
                      {(t.cr_usuarios as { nombre: string } | null)?.nombre ?? "Conductor"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {t.estado === "pendiente" && (
                      <button onClick={() => marcarEnRevision(t.id)} style={btnRevStyle}>
                        <Clock size={14} strokeWidth={1.5} /> En revisión
                      </button>
                    )}
                    {t.estado === "en_revision" && (
                      <>
                        <button onClick={() => aprobarTrayecto(t.id)} style={btnAprStyle} title="Aprobar">
                          <CheckCircle size={16} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => { setMotivoModal({ tipo: "trayecto", id: t.id }); setMotivoText(""); }} style={btnRejStyle} title="Rechazar">
                          <XCircle size={16} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIÁTICOS PENDIENTES */}
          {tab === "viaticos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {viaticos.length === 0 && <p style={emptyStyle}>No hay viáticos pendientes de aprobación.</p>}
              {viaticos.map(v => (
                <div key={v.id} style={rowStyle}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600, margin: "0 0 2px" }}>
                      {v.categoria} — {v.descripcion}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: 13, margin: "0 0 2px" }}>
                      {v.fecha} · {fmt(v.monto)}
                    </p>
                    <p style={{ color: "#FFD600", fontFamily: "DM Sans, sans-serif", fontSize: 12, margin: 0 }}>
                      {(v.cr_usuarios as { nombre: string } | null)?.nombre ?? "Conductor"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => aprobarViatico(v.id)} style={btnAprStyle}>
                      <CheckCircle size={16} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => { setMotivoModal({ tipo: "viatico", id: v.id }); setMotivoText(""); }} style={btnRejStyle}>
                      <XCircle size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INVITACIONES */}
          {tab === "invitaciones" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                <p style={{ color: "#fff", fontFamily: "DM Sans, sans-serif", fontWeight: 600, margin: "0 0 14px" }}>Invitar conductor</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    value={invEmail}
                    onChange={e => setInvEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    type="email"
                    onKeyDown={e => e.key === "Enter" && sendInvitacion()}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={sendInvitacion} disabled={invSending} style={{ ...btnPriStyle, padding: "0 20px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Send size={14} strokeWidth={1.5} /> {invSending ? "…" : "Invitar"}
                  </button>
                </div>
                {invMsg && <p style={{ color: invMsg.startsWith("✅") ? "#00E676" : "#FF4444", fontFamily: "DM Sans, sans-serif", fontSize: 13, margin: "10px 0 0" }}>{invMsg}</p>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {invitaciones.length === 0 && <p style={emptyStyle}>No has enviado invitaciones aún.</p>}
                {invitaciones.map(inv => (
                  <div key={inv.id} style={rowStyle}>
                    <Bell size={16} strokeWidth={1.5} color="rgba(255,255,255,0.3)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 500, margin: "0 0 2px" }}>{inv.email}</p>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: 12, margin: 0 }}>
                        {new Date(inv.created_at).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 600,
                      background: inv.estado === "aceptada" ? "rgba(0,230,118,0.15)" : inv.estado === "expirada" ? "rgba(255,68,68,0.15)" : "rgba(255,214,0,0.15)",
                      color: inv.estado === "aceptada" ? "#00E676" : inv.estado === "expirada" ? "#FF4444" : "#FFD600",
                    }}>
                      {inv.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal motivo rechazo */}
      {motivoModal && (
        <div onClick={() => setMotivoModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0F1525", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 }}>
            <p style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontWeight: 700, margin: "0 0 16px" }}>Motivo del rechazo</p>
            <textarea
              value={motivoText}
              onChange={e => setMotivoText(e.target.value)}
              placeholder="Explica por qué rechazas este registro…"
              rows={3}
              style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical", width: "100%" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setMotivoModal(null)} style={{ ...btnSecStyle, flex: 1 }}>Cancelar</button>
              <button onClick={handleRechazo} style={{ ...btnPriStyle, flex: 1, background: "#FF4444" }}>Rechazar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "20px 18px",
};

const rowStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const emptyStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.4)",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 14,
  textAlign: "center",
  padding: "32px 0",
};

const inputStyle: React.CSSProperties = {
  height: 44,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#fff",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 14,
  padding: "0 14px",
  outline: "none",
  boxSizing: "border-box",
};

const btnPriStyle: React.CSSProperties = {
  height: 44,
  background: "#FFD600",
  color: "#080C18",
  border: "none",
  borderRadius: 10,
  fontFamily: "DM Sans, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const btnSecStyle: React.CSSProperties = {
  height: 36,
  background: "rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  fontFamily: "DM Sans, sans-serif",
  fontSize: 13,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "0 14px",
};

const btnRevStyle: React.CSSProperties = {
  height: 36,
  padding: "0 14px",
  background: "rgba(99,179,237,0.15)",
  border: "1px solid rgba(99,179,237,0.3)",
  borderRadius: 8,
  color: "#63B3ED",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "DM Sans, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
};

const btnAprStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  background: "rgba(0,230,118,0.15)",
  border: "1px solid rgba(0,230,118,0.3)",
  borderRadius: 8,
  color: "#00E676",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const btnRejStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  background: "rgba(255,68,68,0.15)",
  border: "1px solid rgba(255,68,68,0.3)",
  borderRadius: 8,
  color: "#FF4444",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
