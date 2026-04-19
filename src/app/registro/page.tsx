"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Route, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
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

type Plan = "conductor" | "contratista";

export default function Registro() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmar: "",
  });
  const [plan, setPlan] = useState<Plan>("conductor");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { nombre: form.nombre, plan },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-green-dim)", border: "1px solid rgba(0,230,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={28} color="var(--accent-green)" strokeWidth={2} />
          </div>
          <h1 className="font-display" style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Revisa tu correo
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: 28 }}>
            Te enviamos un link de confirmación a{" "}
            <strong style={{ color: "var(--text-primary)" }}>{form.email}</strong>.
            <br />
            Toca el link para activar tu cuenta.
          </p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
            ¿No llegó? Revisa la carpeta de spam o{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              style={{ background: "none", border: "none", color: "var(--accent-yellow)", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem" }}
            >
              vuelve a intentarlo.
            </button>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>
          Crea tu cuenta gratis
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
          14 días gratis · Sin tarjeta · Cancela cuando quieras
        </p>
      </div>

      {/* Plan selector */}
      <div style={{ marginBottom: 28 }}>
        <p style={labelStyle}>¿Cómo usarás CuentaRuta?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(["conductor", "contratista"] as Plan[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              style={{
                background: plan === p ? "var(--accent-yellow-dim)" : "var(--bg-elevated)",
                border: `1px solid ${plan === p ? "rgba(255,214,0,0.4)" : "var(--glass-border)"}`,
                borderRadius: "var(--radius-sm)",
                padding: "14px 12px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.18s ease",
              }}
            >
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: plan === p ? "var(--accent-yellow)" : "var(--text-primary)", marginBottom: 2 }}>
                {p === "conductor" ? "Conductor" : "Contratista"}
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                {p === "conductor" ? "Trabajo independiente" : "Manejo un equipo"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Nombre completo</label>
          <input
            type="text"
            required
            autoComplete="name"
            placeholder="Carlos Rodríguez"
            value={form.nombre}
            onChange={set("nombre")}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,214,0,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
          />
        </div>

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
          <label style={labelStyle}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
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

        <div>
          <label style={labelStyle}>Confirmar contraseña</label>
          <input
            type={showPass ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={form.confirmar}
            onChange={set("confirmar")}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,214,0,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
          />
        </div>

        {error && (
          <div style={{ background: "var(--accent-red-dim)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: "0.88rem", color: "var(--accent-red)" }}>
            {error}{" "}
            {error.includes("ya tiene") && (
              <Link href="/login" style={{ color: "var(--accent-yellow)", fontWeight: 700 }}>Iniciar sesión →</Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", opacity: loading ? 0.7 : 1, fontSize: "1rem" }}
        >
          {loading ? "Creando cuenta..." : (
            <>Crear cuenta gratis <ArrowRight size={16} strokeWidth={1.5} /></>
          )}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-tertiary)", lineHeight: 1.6 }}>
          Al registrarte aceptas los{" "}
          <Link href="/terminos" style={{ color: "var(--text-secondary)" }}>Términos de servicio</Link>
          {" "}y la{" "}
          <Link href="/privacidad" style={{ color: "var(--text-secondary)" }}>Política de privacidad</Link>.
        </p>
      </form>

      <div style={{ textAlign: "center", marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--glass-border)" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--accent-yellow)", fontWeight: 700 }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

// ─── SHELL COMPARTIDO ────────────────────────────────────────────────────────

function AuthShell({ children }: { children: React.ReactNode }) {
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

      {/* Orb fondo */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -80, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(68,136,255,0.05) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Navbar */}
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

      {/* Contenido centrado */}
      <main style={{ position: "relative", zIndex: 1, minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-lg)",
            padding: "40px 36px",
          }}
        >
          {children}
        </div>
      </main>
    </>
  );
}
