"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Check, Zap, Star, Crown } from "lucide-react";

type Plan = "trial" | "basico" | "pro";

const PLANES = [
  {
    id: "trial" as Plan,
    nombre: "Trial",
    precio: "Gratis",
    icon: Zap,
    color: "var(--accent-blue)",
    features: [
      "Hasta 30 trayectos",
      "Hasta 50 viáticos",
      "5 documentos",
      "15 semanas de flujo",
      "Liquidación básica",
    ],
    disabled: false,
  },
  {
    id: "basico" as Plan,
    nombre: "Básico",
    precio: "$29.900 / mes",
    icon: Star,
    color: "var(--accent-green)",
    features: [
      "Trayectos ilimitados",
      "Viáticos ilimitados",
      "Documentos ilimitados",
      "Historial completo",
      "Exportar a Excel",
    ],
    disabled: true,
  },
  {
    id: "pro" as Plan,
    nombre: "Pro",
    precio: "$59.900 / mes",
    icon: Crown,
    color: "var(--accent-yellow)",
    features: [
      "Todo lo de Básico",
      "Multi-moneda",
      "Dashboard empresa",
      "Gestión de flota",
      "Soporte prioritario",
    ],
    disabled: true,
  },
];

export default function PlanPage() {
  const [planActual, setPlanActual] = useState<Plan>("trial");

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data } = await sb.from("cr_usuarios").select("plan").eq("id", user.id).single();
      if (data?.plan) setPlanActual(data.plan as Plan);
    })();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 800 }}>Mi Plan</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>
          Actualmente en plan <strong style={{ color: "var(--accent-green)" }}>
            {PLANES.find((p) => p.id === planActual)?.nombre}
          </strong>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {PLANES.map((plan) => {
          const isActual = plan.id === planActual;
          const PlanIcon = plan.icon;
          return (
            <div key={plan.id} className="glass-card" style={{
              padding: "28px 24px",
              border: isActual ? `2px solid ${plan.color}` : "1px solid var(--glass-border)",
              position: "relative",
              opacity: plan.disabled && !isActual ? 0.7 : 1,
            }}>
              {isActual && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: plan.color, color: "#080C18",
                  padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>
                  Plan actual
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${plan.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <PlanIcon size={20} style={{ color: plan.color }} />
                </div>
                <div>
                  <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 16 }}>{plan.nombre}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{plan.precio}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                    <Check size={13} style={{ color: plan.color, flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                  </div>
                ))}
              </div>

              {plan.disabled ? (
                <div style={{
                  width: "100%", height: 40,
                  background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                  borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "var(--text-tertiary)",
                }}>
                  Próximamente
                </div>
              ) : isActual ? (
                <div style={{
                  width: "100%", height: 40,
                  background: `${plan.color}22`, border: `1px solid ${plan.color}44`,
                  borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: plan.color,
                }}>
                  Plan activo
                </div>
              ) : (
                <button className="btn-primary" style={{ width: "100%", minHeight: 40, padding: "0 16px" }}
                  disabled>
                  Seleccionar
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 32, padding: "18px 20px",
        background: "var(--accent-green-dim)", borderRadius: "var(--radius-md)",
        border: "1px solid var(--accent-green)33",
        textAlign: "center", fontSize: 14, color: "var(--text-secondary)",
      }}>
        Los planes de pago estarán disponibles próximamente. ¡Gracias por ser parte del beta de CuentaRuta!
      </div>
    </div>
  );
}
