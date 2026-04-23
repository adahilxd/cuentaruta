"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Props {
  token: string;
  existeUsuario: boolean;
  emailInvitacion: string;
  nombreContratista: string;
}

export default function UnirseClient({ token, existeUsuario, emailInvitacion, nombreContratista }: Props) {
  const router = useRouter();
  const sb = createClient();

  // Para el flujo de usuario existente: esperar verificación de sesión
  const [sessionReady, setSessionReady] = useState(!existeUsuario);
  const [sessionError, setSessionError] = useState("");

  // Campos del formulario de registro (solo cuando !existeUsuario)
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [placa, setPlaca] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  useEffect(() => {
    if (!existeUsuario) return;
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(`/login?redirect=/unirse/${token}`);
        return;
      }
      if (user.email !== emailInvitacion) {
        setSessionError(`Esta invitación es para ${emailInvitacion}. Estás conectado con otra cuenta.`);
      }
      setSessionReady(true);
    });
  }, [existeUsuario, token, emailInvitacion]);

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
      const { error: signUpErr } = await sb.auth.signUp({ email: emailInvitacion, password });
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

  // Cargando verificación de sesión
  if (existeUsuario && !sessionReady) {
    return (
      <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif" }}>Verificando sesión…</p>
      </div>
    );
  }

  // Error de sesión (cuenta diferente)
  if (sessionError) {
    return (
      <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <h2 style={{ color: "#fff", fontFamily: "Sora, sans-serif", marginBottom: 8 }}>Cuenta incorrecta</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif" }}>{sessionError}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080C18", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 440, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="CuentaRuta" style={{ height: 40, marginBottom: 20 }} />
          <h1 style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
            Únete a CuentaRuta
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "DM Sans, sans-serif", fontSize: 15, margin: 0 }}>
            <strong style={{ color: "#FFD600" }}>{nombreContratista}</strong> te invita a unirte como conductor de su flota.
          </p>
        </div>

        {existeUsuario ? (
          /* ── Usuario existente: solo botón ── */
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
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
          /* ── Usuario nuevo: formulario de registro ── */
          <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input name="email" autoComplete="email" value={emailInvitacion} disabled style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Nombre completo *</label>
              <input name="nombre" autoComplete="name" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Carlos Pérez" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono (WhatsApp)</label>
              <input name="telefono" autoComplete="tel" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+57 300 000 0000" type="tel" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Placa del vehículo</label>
              <input name="placa" autoComplete="off" value={placa} onChange={e => setPlaca(e.target.value)} placeholder="ABC-123" style={{ ...inputStyle, textTransform: "uppercase" }} />
            </div>
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input name="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirmar contraseña *</label>
              <input name="confirmPassword" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Repite tu contraseña" required style={inputStyle} />
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
