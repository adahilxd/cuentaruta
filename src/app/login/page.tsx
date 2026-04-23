"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Route, Eye, EyeOff, ArrowRight } from "lucide-react";
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 8,
};

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Soportar ?redirect= (desde /unirse) y ?next= (flujo general)
  const redirectTo = searchParams.get("redirect") ?? searchParams.get("next") ?? "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Precargar email si venimos de una invitación (/unirse/[token])
  useEffect(() => {
    const match = redirectTo.match(/\/unirse\/([^/?#]+)/);
    if (!match) return;
    const invToken = match[1];
    fetch(`/api/invitaciones/${invToken}`)
      .then(r => r.json())
      .then(d => {
        if (d.email) setForm(f => ({ ...f, email: d.email }));
      })
      .catch(() => {});
  }, [redirectTo]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message.includes("Invalid login")) {
        setError("Correo o contraseña incorrectos.");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Confirma tu correo antes de ingresar. Revisa tu bandeja de entrada.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  const callbackError = searchParams.get("error");

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

      <div style={{ position: "fixed", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,0,0.05) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -80, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(68,136,255,0.05) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      <nav style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(8,12,24,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-yellow-dim)", border: "1px solid rgba(255,214,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Route size={16} color="var(--accent-yellow)" strokeWidth={1.5} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>CuentaRuta</span>
          </Link>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>← Volver al inicio</Link>
        </div>
      </nav>

      <main style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "var(--glass-bg)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "40px 36px" }}>

          <div style={{ marginBottom: 32 }}>
            <h1 className="font-display" style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
              Bienvenido de vuelta
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
              Ingresa a tu cuenta para continuar.
            </p>
          </div>

          {callbackError && (
            <div style={{ background: "var(--accent-red-dim)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: "0.88rem", color: "var(--accent-red)", marginBottom: 20 }}>
              Hubo un error al confirmar tu cuenta. Intenta de nuevo.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={set("email")}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(255,214,0,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Contraseña</label>
                <Link href="/recuperar" style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent-yellow)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-tertiary)")}>
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={set("password")}
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(255,214,0,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex" }}
                >
                  {showPass ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
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
              {loading ? "Ingresando..." : (
                <>Ingresar <ArrowRight size={16} strokeWidth={1.5} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--glass-border)" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              ¿No tienes cuenta?{" "}
              <Link href="/registro" style={{ color: "var(--accent-yellow)", fontWeight: 700 }}>
                Regístrate gratis
              </Link>
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
