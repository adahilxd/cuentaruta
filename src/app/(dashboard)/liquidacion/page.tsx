"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/supabase/queries";
import { Calculator, Info } from "lucide-react";

// Valores 2024 (Colombia)
const SMMLV = 1_300_000;
const AUXILIO_TRANSPORTE = 162_000;

function calcular(ingresoMensual: number) {
  const base = ingresoMensual + AUXILIO_TRANSPORTE;
  const meses = 12;

  // Vacaciones: 15 días por año = 0.5 mes de salario
  const vacaciones = (ingresoMensual / 30) * 15;

  // Cesantías: 1 mes de salario por año de servicio (base incluye aux transporte)
  const cesantias = base / meses;

  // Intereses sobre cesantías: 12% anual = 1% mensual
  const interesCesantias = cesantias * 0.12;

  // Prima de servicios: 15 días en junio + 15 días en diciembre = 1 mes (base)
  const prima = base / meses;

  // Pensión (aporte empleado): 4% del salario
  const pension = ingresoMensual * 0.04;

  // Salud (aporte empleado): 4%
  const salud = ingresoMensual * 0.04;

  return {
    vacaciones,
    cesantias,
    interesCesantias,
    prima,
    pension,
    salud,
    totalPrestaciones: vacaciones + cesantias + interesCesantias + prima,
    totalAportes: pension + salud,
  };
}

type Item = { label: string; value: number; color: string; info: string };

export default function LiquidacionPage() {
  const [ingreso, setIngreso] = useState(SMMLV.toString());

  const ingresoNum = useMemo(() => {
    const n = Number(ingreso.replace(/[^0-9]/g, ""));
    return isNaN(n) ? SMMLV : n;
  }, [ingreso]);

  const result = useMemo(() => calcular(ingresoNum), [ingresoNum]);

  const prestaciones: Item[] = [
    { label: "Vacaciones",             value: result.vacaciones,       color: "var(--accent-blue)",   info: "15 días hábiles / año" },
    { label: "Cesantías",              value: result.cesantias,        color: "var(--accent-green)",  info: "1 mes de salario + aux transporte" },
    { label: "Intereses cesantías",    value: result.interesCesantias, color: "var(--accent-yellow)", info: "12% anual sobre cesantías" },
    { label: "Prima de servicios",     value: result.prima,            color: "#AA88FF",               info: "15 días jun + 15 días dic" },
  ];

  const aportes: Item[] = [
    { label: "Pensión (empleado 4%)", value: result.pension, color: "var(--accent-red)",   info: "4% del salario base" },
    { label: "Salud (empleado 4%)",   value: result.salud,   color: "var(--accent-yellow)", info: "4% del salario base" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 22, fontWeight: 700 }}>Liquidación</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
          Calculadora de prestaciones sociales — Colombia 2024
        </p>
      </div>

      {/* Input salario */}
      <div className="glass-card" style={{ padding: "22px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Ingreso mensual del conductor</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            value={ingreso}
            onChange={(e) => setIngreso(e.target.value)}
            placeholder="Ingresa el salario mensual"
            style={{
              flex: "1 1 200px", height: 48,
              background: "var(--bg-elevated)", border: "1px solid var(--glass-border)",
              borderRadius: 12, padding: "0 16px",
              color: "var(--text-primary)", fontSize: 16, fontFamily: "Sora, sans-serif",
            }}
          />
          <button
            className="btn-primary"
            style={{ padding: "0 20px", height: 48, minHeight: 48 }}
            onClick={() => setIngreso(SMMLV.toString())}
          >
            Usar SMMLV 2024
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-tertiary)", display: "flex", gap: 6, alignItems: "center" }}>
          <Info size={12} />
          SMMLV 2024: {formatCurrency(SMMLV)} · Auxilio transporte: {formatCurrency(AUXILIO_TRANSPORTE)}
        </div>
      </div>

      {/* Prestaciones sociales */}
      <div className="glass-card" style={{ padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Prestaciones sociales (mensual estimado)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {prestaciones.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 4, height: 36, borderRadius: 4, background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{item.info}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color, whiteSpace: "nowrap" }}>
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--glass-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Total prestaciones / mes</span>
          <span style={{ fontWeight: 700, fontSize: 20, fontFamily: "Sora, sans-serif", color: "var(--accent-green)" }}>
            {formatCurrency(result.totalPrestaciones)}
          </span>
        </div>
      </div>

      {/* Aportes de seguridad social */}
      <div className="glass-card" style={{ padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Aportes de seguridad social (mensual)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {aportes.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 4, height: 36, borderRadius: 4, background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{item.info}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color, whiteSpace: "nowrap" }}>
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--glass-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Total aportes / mes</span>
          <span style={{ fontWeight: 700, fontSize: 20, fontFamily: "Sora, sans-serif", color: "var(--accent-red)" }}>
            {formatCurrency(result.totalAportes)}
          </span>
        </div>
      </div>

      {/* Costo total del contrato */}
      <div className="glass-card" style={{
        padding: "22px 24px",
        background: "var(--accent-green-dim)",
        border: "1px solid var(--accent-green)44",
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Costo mensual real del contrato</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
          Salario + prestaciones + aportes (no incluye EPS/ARL empleador)
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--accent-green)" }}>
          {formatCurrency(ingresoNum + result.totalPrestaciones + result.totalAportes)}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-secondary)" }}>
          = {formatCurrency(ingresoNum)} salario + {formatCurrency(result.totalPrestaciones)} prestaciones + {formatCurrency(result.totalAportes)} aportes
        </div>
      </div>

      <div style={{
        marginTop: 16, fontSize: 12, color: "var(--text-tertiary)",
        display: "flex", gap: 6, alignItems: "flex-start",
      }}>
        <Info size={12} style={{ flexShrink: 0, marginTop: 2 }} />
        Este cálculo es orientativo. Consulta a un contador o abogado laboral para liquidaciones oficiales.
        Los valores son proyecciones mensuales basadas en un año completo de servicio.
      </div>
    </div>
  );
}
