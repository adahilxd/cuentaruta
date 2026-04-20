"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Save, Lock, Globe } from "lucide-react";

type Perfil = {
  nombre: string;
  empresa: string;
  rol: string;
  email: string;
};

const MONEDAS = [
  { code: "COP", label: "Peso colombiano (COP)" },
  { code: "USD", label: "Dólar estadounidense (USD)" },
  { code: "MXN", label: "Peso mexicano (MXN)" },
  { code: "PEN", label: "Sol peruano (PEN)" },
  { code: "CLP", label: "Peso chileno (CLP)" },
  { code: "ARS", label: "Peso argentino (ARS)" },
];

export default function ConfiguracionPage() {
  const [perfil, setPerfil] = useState<Perfil>({ nombre: "", empresa: "", rol: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from("cr_usuarios").select("nombre, empresa, rol").eq("id", user.id).single();
      setPerfil({
        nombre: data?.nombre ?? "",
        empresa: data?.empresa ?? "",
        rol: data?.rol ?? "",
        email: user.email ?? "",
      });
      setLoading(false);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      await sb.from("cr_usuarios").update({
        nombre: perfil.nombre,
        empresa: perfil.empresa,
        rol: perfil.rol,
      }).eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function set(k: keyof Perfil, v: string) {
    setPerfil((prev) => ({ ...prev, [k]: v }));
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ color: "var(--text-secondary)" }}>Cargando…</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700 }}>Configuración</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
          Gestiona tu perfil y preferencias de cuenta
        </p>
      </div>

      {/* Perfil */}
      <form onSubmit={handleSave}>
        <div className="glass-card" style={{ padding: "24px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Información del perfil</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label className="form-group">
              <span>Nombre completo</span>
              <input type="text" value={perfil.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Tu nombre" />
            </label>
            <label className="form-group">
              <span>Empresa / Contratante</span>
              <input type="text" value={perfil.empresa}
                onChange={(e) => set("empresa", e.target.value)}
                placeholder="Ej. CHEC, ISA, Celsia…" />
            </label>
            <label className="form-group">
              <span>Rol / Cargo</span>
              <input type="text" value={perfil.rol}
                onChange={(e) => set("rol", e.target.value)}
                placeholder="Ej. conductor, operador…" />
            </label>
            <label className="form-group">
              <span>Correo electrónico</span>
              <div style={{ position: "relative" }}>
                <input type="email" value={perfil.email} disabled
                  style={{
                    width: "100%",
                    background: "var(--bg-elevated)", border: "1px solid var(--glass-border)",
                    borderRadius: 10, padding: "10px 36px 10px 12px",
                    color: "var(--text-tertiary)", fontSize: 14, fontFamily: "inherit",
                    cursor: "not-allowed",
                  }} />
                <Lock size={13} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>No se puede cambiar el correo por aquí</span>
            </label>
          </div>
          <button type="submit" className="btn-primary"
            style={{ marginTop: 20, padding: "10px 22px", minHeight: 42, fontSize: 14 }}
            disabled={saving}>
            <Save size={15} />
            {saved ? "¡Guardado!" : saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Moneda */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: 20, opacity: 0.75 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={16} style={{ color: "var(--text-secondary)" }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Moneda</span>
          </div>
          <span style={{
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: "var(--accent-yellow-dim)", color: "var(--accent-yellow)",
          }}>
            Próximamente
          </span>
        </div>
        <select disabled style={{
          width: "100%", height: 42,
          background: "var(--bg-elevated)", border: "1px solid var(--glass-border)",
          borderRadius: 10, padding: "0 12px",
          color: "var(--text-tertiary)", fontSize: 14, fontFamily: "inherit",
          cursor: "not-allowed",
        }}>
          {MONEDAS.map((m) => (
            <option key={m.code} value={m.code}>{m.label}</option>
          ))}
        </select>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
          La selección de moneda estará disponible en la próxima versión
        </div>
      </div>

      {/* Seguridad */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Seguridad</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
          Para cambiar tu contraseña, cierra sesión y usa la opción "¿Olvidaste tu contraseña?" en el login.
        </div>
        <button
          onClick={async () => {
            const sb = createClient();
            await sb.auth.signOut();
            window.location.href = "/login";
          }}
          style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "var(--accent-red-dim)", border: "1px solid var(--accent-red)44",
            color: "var(--accent-red)", cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <style>{`
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group span { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
        .form-group input {
          background: var(--bg-elevated); border: 1px solid var(--glass-border);
          border-radius: 10px; padding: 10px 12px;
          color: var(--text-primary); font-size: 14px; font-family: inherit; width: 100%;
        }
        .form-group input:focus { outline: none; border-color: var(--accent-green); }
      `}</style>
    </div>
  );
}
