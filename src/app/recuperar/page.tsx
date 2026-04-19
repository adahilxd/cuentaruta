"use client";

import { useState } from "react";
import Link from "next/link";
import { Route, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export const dynamic = "force-dynamic";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--glass-border)",
  borderRadius: "var(--radius-sm)",
  padding: "14px 16px",
  color: "var(--text-primary)",
  fontSize: "1rem",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/perfil/nueva-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <>
      <style>{`
        body { background: var(--bg-base); }
        input::placeholder { color: var(--text-tertiary); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px var(--bg-elevated) inset !important;
          -webkit-text-fill-color: var(--text-primary) !important;
        }
      `}</style>

      <div style={{ position: "fixed", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,230,118,0.05) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <nav style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(8,12,24,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Route size={16} color="var(--accent-yellow)" strokeWidth={1.5} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>CuentaRuta</span>
          </Link>
          <Link href="/login" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>← Volver al login</Link>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "var(--glass-bg)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "40px 36px" }}>

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <Check size={28} color="var(--accent-green)" strokeWidth={2} />
              </div>
              <h1 className="font-display" style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
                Revisa tu correo
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.65, marginBottom: 28 }}>
                Enviamos un link para restablecer tu contraseña a{" "}
                <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
              </p>
              <Link href="/login" style={{ color: "var(--accent-yellow)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
                ← Volver al login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 className="font-display" style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
                  Recupera tu acceso
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                  Ingresa tu correo y te enviamos un link para crear una nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(255,214,0,0.4)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
                  />
                </div>

                {error && (
                  <div style={{ background: "var(--accent-red-dim)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: "0.88rem", color: "var(--accent-red)" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: "100%", opacity: loading ? 0.7 : 1, fontSize: "1rem" }}
                >
                  {loading ? "Enviando..." : (
                    <>Enviar link de recuperación <ArrowRight size={16} strokeWidth={1.5} /></>
                  )}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Link href="/login" style={{ fontSize: "0.88rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
                  ← Volver al login
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
