"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface InvData {
  email: string;
  estado: string;
  expires_at: string;
  contratista_nombre: string;
  contratista_id: string;
  tieneaccount: boolean;
}

export default function UnirsePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const sb = createClient();

  const [inv, setInv] = useState<InvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Flujo usuario existente
  const [yaTieneCuenta, setYaTieneCuenta] = useState(false);

  // Flujo registro nuevo
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [placa, setPlaca] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const [invRes, { data: { user } }] = await Promise.all([
          fetch(`/api/invitaciones/${token}`).then(r => r.json()),
          sb.auth.getUser(),
        ]);

        if (invRes.error) { setError(invRes.error); return; }

        const invData: InvData = invRes;
        setInv(invData);

        if (invData.tieneaccount) {
          if (!user) {
            router.replace(`/login?redirect=/unirse/${token}`);
            return;
          }
          if (user.email !== invData.email) {
            setError(`Esta invitación es para ${invData.email}. Estás conectado con otra cuenta.`);
            return;
          }
          setYaTieneCuenta(true);
        }
      } catch {
        setError("Error al cargar la invitación");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [token]);

  async function handleAceptar() {
    setSubmitErr("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitaciones/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingUser: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al aceptar invitación");
      router.push("/dashboard");
    } catch (err: unknown) {
      setSubmitErr(err instanceof Error ? err.message : "Error inesperado");
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitErr("");
    if (password !== confirm) { setSubmitErr("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setSubmitErr("Contraseña mínimo 6 caracteres"); return; }
    if (!nombre.trim()) { setSubmitErr("El nombre es requerido"); return; }

    setSubmitting(true);
    try {
      const { error: signUpErr } = await sb.auth.signUp({
        email: inv!.email,
        password,
      });
      if (signUpErr) throw new Error(signUpErr.message);

      const res = await fetch(`/api/invitaciones/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), telefono: telefono.trim(), placa: placa.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al aceptar invitación");

      router.push("/dashboard");
    } catch (err: unknown) {
      setSubmitErr(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif" }}>Cargando invitación…</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2 style={{ color: "#fff", fontFamily: "Sora, sans-serif", marginBottom: 8 }}>Invitación no válida</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif" }}>{error}</p>
      </div>
    </div>
  );

  if (inv?.estado !== "pendiente") return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: "#fff", fontFamily: "Sora, sans-serif", marginBottom: 8 }}>Invitación ya usada</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif" }}>Esta invitación ya fue aceptada.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="CuentaRuta" style={{ height: 40, marginBottom: 20 }} />
          <h1 style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            Únete a CuentaRuta
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "DM Sans, sans-serif", fontSize: 15, margin: 0 }}>
            <strong style={{ color: "#FFD600" }}>{inv!.contratista_nombre}</strong> te invita a unirte como conductor de su flota.
          </p>
        </div>

        {yaTieneCuenta ? (
          /* ── Flujo: ya tiene cuenta ── */
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20, textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>👋</div>
            <div>
              <p style={{ color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 16, margin: "0 0 8px", fontWeight: 600 }}>
                ¡Bienvenido de nuevo!
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontFamily: "DM Sans, sans-serif", fontSize: 14, margin: 0 }}>
                Ya tienes una cuenta con <strong style={{ color: "#FFD600" }}>{inv!.email}</strong>.<br />
                Al aceptar quedarás vinculado a la flota de <strong style={{ color: "#FFD600" }}>{inv!.contratista_nombre}</strong>.
              </p>
            </div>
            {submitErr && (
              <p style={{ color: "#FF4444", fontFamily: "DM Sans, sans-serif", fontSize: 13, margin: 0 }}>{submitErr}</p>
            )}
            <button
              onClick={handleAceptar}
              disabled={submitting}
              style={{
                height: 52,
                background: submitting ? "rgba(255,214,0,0.4)" : "#FFD600",
                color: "#080C18",
                border: "none",
                borderRadius: 10,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {submitting ? "Aceptando…" : "Aceptar invitación"}
            </button>
          </div>
        ) : (
          /* ── Flujo: registro nuevo ── */
          <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input name="email" autoComplete="email" value={inv!.email} disabled style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input
                name="nombre"
                autoComplete="name"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Carlos Pérez"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Teléfono (WhatsApp)</label>
              <input
                name="telefono"
                autoComplete="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
                type="tel"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Placa del vehículo</label>
              <input
                name="placa"
                autoComplete="off"
                value={placa}
                onChange={e => setPlaca(e.target.value)}
                placeholder="ABC-123"
                style={{ ...inputStyle, textTransform: "uppercase" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirmar contraseña *</label>
              <input
                name="confirmPassword"
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                type="password"
                placeholder="Repite tu contraseña"
                required
                style={inputStyle}
              />
            </div>

            {submitErr && (
              <p style={{ color: "#FF4444", fontFamily: "DM Sans, sans-serif", fontSize: 13, margin: 0 }}>{submitErr}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 4,
                height: 52,
                background: submitting ? "rgba(255,214,0,0.4)" : "#FFD600",
                color: "#080C18",
                border: "none",
                borderRadius: 10,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {submitting ? "Creando cuenta…" : "Aceptar invitación"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.6)",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 13,
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#fff",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 15,
  padding: "0 14px",
  boxSizing: "border-box",
  outline: "none",
};
